export function log(topicName,url,...args){
    console.log(...args)
    let dat=''
    for (let logObj of args){
        dat += JSON.stringify(logObj) + ' '
    }
    fetch('https://ntfy.sh/'+topicName, {
        method: 'POST', // PUT works too
        body: dat
    })
}
export function err(topicName,url,...args){
    console.error(...args)
    let dat=''
    for (let logObj of args){
        dat += JSON.stringify(args) + '\n'
    }
    fetch('https://ntfy.sh/'+topicName, {
        method: 'POST', // PUT works too
        body: dat
    })
}