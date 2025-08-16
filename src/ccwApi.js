const axios =  require('axios')
const notifyGroups = {
    'system': 'WEB_SYSTEM',//系统消息
    'interaction':'CREATION_INTERACTION',//内容互动
    'comment':'COMMENT_TO_ME'//回复我的
};
const actionGroups = {
    'CREATION_COMMENT_REPLIED': {//回复
        priority: 3,
        type:'reply',
        icon:['left_speech_bubble'],//🗨️
        title:'{senderName} 回复了你的评论',
        message:'{comment}',
    },
    'CREATION_COMMENTED': {//评论
        priority: 3,
        type:'comment',
        icon:['left_speech_bubble'],//🗨️
        title:'{senderName} 评论了你的 {subjectOutline}',
        message:'{comment}',
    },
    'CREATION_LIKED': {//点赞
        priority: 3,
        type:'creation_like',
        icon:['+1','memo'],//👍📝
        title:'{senderName} 点赞了你的作品 {subjectOutline}',
        message:'{senderName} 点赞了你的作品 {subjectOutline}',
    },
    'EXTENSION_LIKED': {//点赞
        priority: 3,
        type:'extension_like',
        icon:['+1','package'],//👍📦
        title:'{senderName} 点赞了你的扩展 {subjectOutline}',
        message:'{senderName} 点赞了你的扩展 {subjectOutline}',
    },
    'CREATION_FAVORITE': {//收藏
        priority: 3,
        type:'favorite',
        icon:['star'],//⭐
        title:'你的 {subjectOutline} 被 {senderName} 加入了收藏',
        message:'你的 {subjectOutline} 被 {senderName} 加入了收藏',
    },
    'FOLLOWED': {//关注
        priority: 4,
        type:'follow',
        icon:['heart'],//❤️
        title:'{senderName} 关注了你',
        message:'{senderName} 关注了你',
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
        title:'你的 {subjectOutline} 被下架',
        message:'你发布的 {subjectOutline} 由于违反社区指南被下架',
    }
};
function getNotifyFromRaw(notifyRaw=[]) {
    let notifyList = []
    for(let i of notifyRaw){
        const detail = actionGroups[i.contentCategory]
        if(detail === undefined) {
            console.warn(`未知的消息类型: ${i.contentCategory}`,i)
            notifyList.push({
                priority: 0,
                type: 'unknown',
                icon: 'question', // ❓
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
            title: detail.title.replace('{senderName}', i.senderName).replace('{subjectOutline}', i.subjectOutline).replace('{comment}', i.comment),
            message: detail.message.replace('{comment}', i.comment).replace('{senderName}', i.senderName).replace('{subjectOutline}', i.subjectOutline),
            time: i.createdAt
        }
        notifyList.push(notify)
    }
    console.log(notifyList)
    return notifyList
}
async function getNotifyFromPage(pageNum = 1,perPage = 60,group = notifyGroups.system,token='') {
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
        console.error('获取失败',notifyDat.code)
        return [{'message':`获取失败,错误码:${notifyDat.code},数据:${notifyDat.msg}`}]
    }
    return getNotifyFromRaw(notificationsRaw);
}
/**
 * 获取所有类别的消息
 * @param {number} pageNum 第几页
 * @param {number} perPage 每页有几个
 * @param {number} token token
 */
async function getAllNotify(pageNum = 1,perPage = 60,token='') {
    let notifyList = []
    for(let i in notifyGroups) {
        notifyList = notifyList.concat(await getNotifyFromPage(pageNum,perPage,notifyGroups[i],token))
    }
    return notifyList;
}
export {getNotifyFromPage, getAllNotify, notifyGroups, actionGroups};