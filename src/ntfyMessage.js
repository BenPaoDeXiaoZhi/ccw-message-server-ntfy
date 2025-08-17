class basicMessage {
    constructor(id,time,event,topic){
        this.id = id;
        this.time = time;
        this.event = event;
        this.topic = topic;
    }
}
class ntfyAction{
    constructor(action='view', label='open') {
        this.id = Date.now() % Math.pow(10,10)
        this.action = action; // 'view', 'broadcast', 'http'
        this.label = label; // 按钮显示的文字
    }
}
export class ntfyViewAction extends ntfyAction {
    constructor(label='open', url='', clear=true) {
        super('view', label);
        this.url = url; // 点击后跳转的链接
        this.clear = clear; // 是否在点击后清除通知
    }
}
export class ntfyHttpAction extends ntfyAction {
    constructor(label='open', url='', method='post', headers={}, body='', clear=true) {
        super('http', label);
        this.url = url; // 点击后跳转的链接
        this.clear = clear; // 是否在点击后清除通知
    }
}
export class ntfyMessage extends basicMessage {
    /**
     * 
     * @param {string} id 任意字符串,消息的唯一id
     * @param {number} time 发送时间戳(秒)
     * @param {number} expires 过期时间戳(秒)
     * @param {string} topic 主题,应与当前订阅的主题一致
     * @param {string} message 信息
     * @param {string} title 标题
     * @param {string} tags emoji表情,非emoji则会显示在最下方
     * @param {number} priority 优先级(1~5) 1最低,5最高,3默认
     * @param {string} click 点击以后跳转的链接 
     * @param {(ntfyViewAction|ntfyAction)} actions 
     * @param {*} attachment 
     */
    constructor(id, time=0, expires=0, topic='test', message='hello world', title='hello from ntfy', tags=[], priority=3,click='',actions=[],attachment={}) {
        super(id, time, 'message', topic);
        this.message = message;
        this.title = title;
        this.expires = expires;
        this.priority = priority; // 1~5
        this.click = click;
        this.attachment = attachment; // {url:'', content-type:''}
        this.tags = tags;
        this.actions = actions
    }
    setTime(time) {
        this.time = time;
        this.expires = time + 60*60*24*7; // 默认过期时间为1周
    }
}