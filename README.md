- ## what is ccw?   
  - # [ccw](https://ccw.site) stands for deploying Scratch projects and makes them run really fast.It is a scratch community.

- ## what is ntfy?   
  - # [ntfy](https://ntfy.sh) is a simple http-based pub-sub notification service. You can find their open-source repository in github.    

- ## how does this works?   
  - # it is deployed on cloudflare worker, when the ntfy client polls the notification from the worker, it will send a authorzation that contains your token of ccw. When the worker receives the request, it will fetch the latest notifications from ccw server and convert them to ntfy-json format, then send it back.