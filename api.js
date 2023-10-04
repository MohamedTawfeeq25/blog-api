//importing required libraries
const express=require('express');
const app=express();
const axios=require('axios');
const load=require('lodash');
//api for Data Analysis
app.get('/api/blog-stats',(req,resp)=>{
    var data;var longest_title;var title=[];

    function calculation(data)
    {
        //Data Analysis
        for(var i=0;i<data.blogs.length;i++){
            title.push(data.blogs[i].title);
        }
        var similar=load.filter(title,(t)=>load.includes(t,"Privacy"));
        longest_title=load.maxBy(title,tit=>tit.length);
        var result={no_of_blog:data.blogs.length,longest_title:longest_title,privacy_count:similar.length,title:load.uniq(title)};
        return result;
    }
        //fetching data from blog api
        axios.get('https://intent-kit-16.hasura.app/api/rest/blogs',{  headers: {
            'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6'
          }})
        .then((res)=>{
            data=res.data;
            try//error handling
            {
                var calc=load.memoize(calculation);//cache memory
                resp.send(calc(data));
                console.log(calc(data));
            }
            catch(e){
                console.log("blog-stat api error:"+e);
                return e;
            }
            
        })
        .catch((err)=>{
            console.log("third-party api error:"+err);
        });
});
//api for blog searching
app.get('/api/blog-search',(req,resp)=>{
    var query=req.query.query.toLowerCase();//fetching the query and convert to case-insensitive
    
    var data;var title=[];
    function load_data(data){
        //data fetching
        for(var i=0;i<data.blogs.length;i++){
            title.push(data.blogs[i].title);
        }
        var tit=load.uniq(title);
        var similar=load.filter(tit,(t)=>load.includes(t.toLowerCase(),query));
        var result={search_result:similar};
        return result;
    }
    //fetching data from blog api
    axios.get('https://intent-kit-16.hasura.app/api/rest/blogs',{  headers: {
        'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6'
      }})
    .then((res)=>{
        try{//error handling
        data=res.data;
        var clc=load.memoize(load_data);//cache memory
        console.log(clc(data));
        resp.json(clc(data));
        }
        catch(e){
            console.log("search api error:"+e);
        }
    })
    .catch((err)=>{
        console.log("third-party api error:"+err);
    });
})
app.listen(8000,()=>{console.log("server started")});