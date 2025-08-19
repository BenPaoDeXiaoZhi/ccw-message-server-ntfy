/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

const topics = [
	'ccw-message',
	//'test'
]
import * as ntfyMessage from './ntfyMessage.js';
import * as ccwApi from './ccwApi.js';
function ccwNotifyToNtfy(notify){
	let ntfyMessages = []
	for (let i of notify){
		const ntfyMessageObj = new ntfyMessage.ntfyMessage(
			`ccw-${i.type}-${i.time}`, // id
			Math.floor(i.time/1000), // time
			0, // expires, set later
			'ccw-message', // topic
			i.message, // message
			i.title, // title
			i.icon, // tags
			i.priority, // priority
			i.clickUrl || '', // click
			i.actions || [], // actions
			i.attatchment || {} // attachment
		);
		ntfyMessageObj.setTime(Math.floor(i.time/1000));
		ntfyMessages.push(JSON.stringify(ntfyMessageObj));
	}
	return ntfyMessages.join('\n')
}
export default {
	async fetch(req, env, ctx) {
		const url = new URL(req.url);
		console.log(req)
		if(req.method =='OPTIONS') {
			return new Response('', { status: 200 ,headers:{
				'Access-Control-Allow-Headers': '*',
				'Access-Control-Allow-Origin': 'https://ntfy.sh'
			}});
		}
		if(!topics.includes(url.pathname.split('/')[1])) {
			return new Response(`不是有效的ntfy主题,请使用${topics.join('或')}`, { status: 404 });
		}
		if(url.pathname.split('/').length === 3) {
			switch (url.pathname.split('/')[2]) {
				case 'auth':
					if(!req.headers.get('Authorization')) {
						return new Response('没有Authorization头部,请使用basic auth进行身份验证', { status: 401});
					}
					if(!req.headers.get('Authorization').startsWith('Basic ')) {
						console.warn('Authorization类型不是basic,请使用basic auth进行身份验证');
						return new Response('Authorization类型不是basic,请使用basic auth进行身份验证', { status: 405});
					}
					// console.log(atob(req.headers.get('Authorization').split('Basic ')[1]))
					return new Response(JSON.stringify({"success":true}),{status:200});
				case 'json':
					if(!req.headers.get('Authorization')) {
						return new Response('没有Authorization头部,请使用basic auth进行身份验证', { status: 404});
					}
					if(!req.headers.get('Authorization').startsWith('Basic ')) {
						return new Response('Authorization类型不是basic,请使用basic auth进行身份验证', { status: 403});
					}
					const auth = atob(req.headers.get('Authorization').split('Basic ')[1])
					if(auth.split(':').length !== 2) {
						return new Response('身份验证错误,请将user:password通过base64编码以后发送', { status: 402});
					}
					if(auth.split(':')[1].trim().length !== 40) {
						console.warn('token格式不正确,请检查token是否正确',auth.split(':')[1])
						return new Response('身份验证错误,token格式不正确', { status: 401});
					}
					
					// console.log(ccwNotifyToNtfy(await ccwApi.getAllNotify(1,10,auth.split(':')[1],url.searchParams.get('since')||'all')),{status:200})
					return new Response(ccwNotifyToNtfy(await ccwApi.getAllNotify(1,10,auth.split(':')[1],url.searchParams.get('since')||'all')),{status:200})
				case 'test':
					if(env.TEST_TOKEN){
						console.log('使用测试token',env.TEST_TOKEN)
						let notifies = await getAllNotify(1,10,env.TEST_TOKEN,url.searchParams.get('since')||'all')
						notifies = notifies.sort((a,b)=>b.time - a.time)
						// console.log(notifies);
						return new Response(ccwNotifyToNtfy(notifies),{status: 200});
					}
					else{
						return new Response('没有配置测试token', { status: 500 });
					}
			}
		}
		return new Response('不正确的请求url',{status: 404});
	},
};
