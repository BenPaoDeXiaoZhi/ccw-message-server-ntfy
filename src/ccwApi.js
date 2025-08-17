const axios =  require('axios')
import * as ntfyMessage from './ntfyMessage.js';
export const notifyGroups = {
    'system': 'WEB_SYSTEM',//系统消息
    'interaction':'CREATION_INTERACTION',//内容互动
    'comment':'COMMENT_TO_ME'//回复我的
};
export const actionGroups = {
    'CREATION_COMMENT_REPLIED': {//回复
        priority: 3,
        type:'reply',
        icon:['left_speech_bubble'],//🗨️
        title:'@{senderName} 回复了你在《{subjectOutline}》中的的评论\"{message}\"',
        message:'{comment}',
    },
    'CREATION_COMMENTED': {//评论
        priority: 3,
        type:'comment',
        icon:['left_speech_bubble'],//🗨️
        title:'@{senderName} 评论了你的 《{subjectOutline}》',
        message:'{comment}',
    },
    "CREATION_REMIXED": {//改编并发布了作品
        priority: 4,
        type:'creation_remixed',
        icon:['memo'],//📝
        title:'@{senderName} 改编并发布了新作品 《{subjectOutline}》',
        message:'@{senderName} 改编并发布了新作品 《{subjectOutline}》',
    },
    "PROFILE_LEAVE_WORDS":{
        priority: 4,
        type:'leave_words',
        icon:['left_speech_bubble'],//🗨️
        title:'@{senderName} 在你的留言板下留言 \"{comment}\"',
        message:'@{senderName} 在你的留言板下留言 \"{comment}\"',
    },
    'CREATION_LIKED': {//点赞
        priority: 3,
        type:'creation_like',
        icon:['+1','memo'],//👍📝
        title:'@{senderName} 点赞了你的作品 《{subjectOutline}》',
        message:'@{senderName} 点赞了你的作品 《{subjectOutline}》',
    },
    'EXTENSION_LIKED': {//点赞
        priority: 3,
        type:'extension_like',
        icon:['+1','package'],//👍📦
        title:'@{senderName} 点赞了你的扩展 《{subjectOutline}》',
        message:'@{senderName} 点赞了你的扩展 《{subjectOutline}》',
    },
    'CREATION_FAVORITE': {//收藏
        priority: 3,
        type:'favorite',
        icon:['star'],//⭐
        title:'你的 《{subjectOutline}》 被 @{senderName} 加入了收藏',
        message:'你的 《{subjectOutline}》 被 @{senderName} 加入了收藏',
    },
    'FOLLOWED': {//关注
        priority: 4,
        type:'follow',
        icon:['heart'],//❤️
        title:'@{senderName} 关注了你',
        message:'@{senderName} 关注了你',
    },
    'SESSION_CREATED': {//登录
        priority: 5,
        type:'login',
        icon:['bust_in_silhouette','warning'],//👤⚠️
        title:'{comment}',
        message:'{comment}',
    },
    'CREATION_BANNED': {//内容被封禁
        priority: 5,
        type:'banned',
        icon:['no_entry'],//🚫
        title:'你的 《{subjectOutline}》 被下架',
        message:'你发布的 《{subjectOutline}》 由于违反社区指南被下架',
    }
};
function getNotifyFromRaw(notifyRaw=[],since=0) {
    let notifyList = []
    for(let i of notifyRaw){
        if(i.createdAt < since) {
            continue; // 如果消息时间早于since，则跳过
        }
        const detail = actionGroups[i.contentCategory]
        if(i.contentCategory === 'RAW'){
            notifyList.push(i)
            continue
        }
        if(detail === undefined) {
            console.warn(`未知的消息类型: ${i.contentCategory}`,JSON.stringify(i))
            notifyList.push({
                priority: 3,
                type: 'unknown',
                icon: ['question'], // ❓
                title: `未知消息类型: ${i.contentCategory}`,
                message: JSON.stringify(i),
                time: i.createdAt
            })
            continue
        }
        const notify = {
            priority: detail.priority,
            type: detail.type,
            icon: detail.icon,
            title: detail.title
            .replace('{senderName}', i.senderName)
            .replace('{subjectOutline}', i.subjectOutline)
            .replace('{comment}', i.comment)
            .replace('{message}', i.message),
            message: detail.message
            .replace('{comment}', i.comment)
            .replace('{senderName}', i.senderName)
            .replace('{subjectOutline}', i.subjectOutline)
            .replace('{message}',i.mesaage),
            time: i.createdAt,//毫秒为单位
        }
        switch (notify.type){
            case 'login':
                notify.actions = [
                    new ntfyMessage.ntfyViewAction('查看详情', `https://www.ccw.site/profile/device`, false)
                ]
                break;
        }
        notifyList.push(notify)
    }
    // console.log(notifyList)
    return notifyList
}
async function getNotifyFromPage(pageNum = 1,perPage = 60,group = notifyGroups.system,token='',since=0) {
    // console.log(`获取${group}消息,页码:${pageNum},每页:${perPage}`)
    const apiUrl = `https://community-web.ccw.site/notification/page?page=${pageNum}&sortType=DESC&perPage=${perPage}`
    const fet = await axios.post(apiUrl,`{"notifyGroup":"${group}"}`,{headers:{
        'Content-Type':'application/json;charset=UTF-8',
        "Cookie":`token=${token}`,
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
    }})
    const notifyDat = fet.data
    let notificationsRaw = []
    if(notifyDat.code === '200'){
        notificationsRaw = notifyDat.body.data
    }else{
        return {dat:[{
            contentCategory:'RAW',
            type: 'data error',
            message:`获取失败,http错误码:${notifyDat.status},错误码:${notifyDat.code},数据:${notifyDat.msg}`,
            title:'获取失败',
            icon:['warning'],
            priority:5,
            time:Date.now(),
            clickUrl: notifyDat.status===401 ? 'https://ntfy.schale.qzz.io/login': 'https://ntfy.schale.qzz.io',
        }],status:'error'}
    }
    return {dat:notificationsRaw,status:'ok'}
}
/**
 * 获取所有类别的消息
 * @param {number} pageNum 第几页
 * @param {number} perPage 每页有几个
 * @param {number} token token
 * @param {string} sinceId sinceId,如果是all则获取所有消息,如果是none则不获取任何消息,如果是其他则获取大于该id的消息
 */
export async function getAllNotify(pageNum = 1,perPage = 60,token='',sinceId='all') {
    let notifyList = []
    let sinceTime;
    switch(sinceId) {
        case 'all':
            sinceTime = 0;
            break;
        case 'none':
            return []
        default:
            sinceTime = sinceId.split('-')[2] || 0 //ccw-favorite-1755390482542
            break
    }
    for(let i in notifyGroups) {
        let firstNotifies = await getNotifyFromPage(1,1,notifyGroups[i],token,sinceTime)
        if(firstNotifies.status === 'error') {
            notifyList = notifyList.concat(firstNotifies.dat)
            break; // 如果获取失败，则停止继续获取
        }
        if(firstNotifies.dat.length === 0) {
            continue;
        }
        if(firstNotifies.dat[0].createdAt < sinceTime) {
            continue; // 如果第一页的消息时间早于since，则跳过
        }
        let notifyRaw = await getNotifyFromPage(pageNum,perPage,notifyGroups[i],token,sinceTime)
        let notify_formatted = getNotifyFromRaw(notifyRaw.dat,sinceTime)
        notifyList = notifyList.concat(notify_formatted)
    }
    return notifyList;
}