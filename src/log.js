import * as ntfyMessage from "./ntfyMessage.js"

export const levelMap = {
    log: {
        pre: 'log',
        priority:3,
        tags:["memo"]
    },
    warn: {
        pre: '!warn',
        priority:4,
        tags:["warning"]
    },
    error: {
        pre: '!!raise error',
        priority:5,
        tags:['bangbang']
    }
}

async function pushLog(topicName, level, ...args) {
    let dat = `${levelMap[level].pre} while responding\n`
    for (let logObj of args) {
        dat += JSON.stringify(logObj) + ' '
    }
    const ntfyMsg = new ntfyMessage.ntfyMessage(Date.now(), 0, 0, topicName, dat, "notify from cf", levelMap[level].tags)
    ntfyMsg.setTime(Math.floor(Date.now() / 1000))
    console.log('pushing data', JSON.stringify(ntfyMsg))
    const fet = await fetch('https://ntfy.sh/', {
        method: 'POST', // PUT works too
        body: JSON.stringify(ntfyMsg)
    })
    if (!fet.ok) {
        console.error("请求不成功", fet.status, await fet.body())
    }
}
export async function log(topicName, ...args) {
    console.log(...args)
    await pushLog(topicName,'log',...args)
}
export async function err(topicName, ...args){
    console.error(...args)
    await pushLog(topicName,'error',...args)
}
export async function warn(topicName, ...args){
    console.warn(...args)
    await pushLog(topicName,'warn',...args)
}