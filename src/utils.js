export function toTitle(s){
    return s.charAt(0).toUpperCase() + s.slice(1)
}
export function toCamel(s,a){
    const c=s.split(a)
    let r=c[0]
    for(let word of c.slice(1)){
        r+=toTitle(word)
    }
    return r
}
export function getImageFromMarkdown(md){
    const imgStrs = md.match(/!\[(.*)\]\((.+)\)/g) || []
    return imgStrs.map((dat)=>{
        const imgs = dat.match(/!\[(.*)\]\((.+)\)/)
        if(imgs)return {alt:imgs[1],src:imgs[2]}
    })
}