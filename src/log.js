import * as ntfyMessage from "./ntfyMessage.js"
export function log(topicName,url,...args){
    console.log(...args)
    let dat='log while responding '+url+"\n"
    for (let logObj of args){
        dat += JSON.stringify(logObj) + ' '
    }
    const ntfyMsg=new ntfyMessage.ntfyMessage(Date.now(),0,0,topicName,dat,"log from cf",["memo"])
    ntfyMsg.setTime(Math.floor(Date.now()/1000))
    console.log('pushing data',JSON.stringify(ntfyMsg))
    fetch('https://ntfy.sh/', {
        method: 'POST', // PUT works too
        body: JSON.stringify(ntfyMsg)
    })
}
export function err(topicName,url,...args){
    console.error(...args)
    let dat='error while responding '+url
    for (let logObj of args){
        dat += JSON.stringify(args) + '\n'
    }
    fetch('https://ntfy.sh/'+topicName, {
        method: 'POST', // PUT works too
        body: dat
    })
}