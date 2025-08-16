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
import {ntfyMessage} from './ntfyMessage.js';
import {getAllNotify, getNotifyFromPage, notifyGroups} from './ccwApi.js';
function ccwNotifyToNtfy(notify){
	let ntfyMessages = []
	for (let i of notify){
		const ntfyMessageObj = new ntfyMessage(
			`ccw-${i.type}-${i.time}`, // id
			Math.floor(i.time/1000), // time
			0, // expires, set later
			'ccw-message', // topic
			i.message, // message
			i.title, // title
			i.icon, // tags
			i.priority, // priority
			'', // click
			[], // actions
			{} // attachment
		);
		ntfyMessageObj.setTime(Math.floor(i.time/1000));
		ntfyMessages.push(JSON.stringify(ntfyMessageObj));
	}
	return ntfyMessages.join('\n')
}
export default {
	async fetch(req, env, ctx) {
		const url = new URL(req.url);
		console.log(url);
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
						return new Response('Authorization类型不是basic,请使用basic auth进行身份验证', { status: 401});
					}
					console.log(atob(req.headers.get('Authorization').split('Basic ')[1]))
					return new Response('{\"success\":\"true\"}',{status:200});
				case 'json':
					if(!req.headers.get('Authorization')) {
						return new Response('没有Authorization头部,请使用basic auth进行身份验证', { status: 401});
					}
					if(!req.headers.get('Authorization').startsWith('Basic ')) {
						return new Response('Authorization类型不是basic,请使用basic auth进行身份验证', { status: 401});
					}
					const auth = atob(req.headers.get('Authorization').split('Basic ')[1])
					if(auth.split(':').length !== 2) {
						return new Response('身份验证错误,请将user:password通过base64编码以后发送', { status: 401});
					}
					if(auth.split(':')[1].length !== 40) {
						return new Response('身份验证错误,token格式不正确', { status: 401});
					}
					return new Response(ccwNotifyToNtfy(await getAllNotify(1,10,auth.split(':')[1])),{status:200})
			}
		}
		const notifies = await getAllNotify(1,10,'rFyesGUgGqT4crsi63c2807d669fa967f17f5559')
		return new Response(JSON.stringify(notifies),{status: 200});
	},
};
