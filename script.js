$(function() {
    const cardheader = $(".card-header").get(0).outerHTML;
    const posts = $(".postContainer").get(0).outerHTML;
    const replies = $(".replyContainer").get(0).outerHTML;
    const wcomments = $(".writeComment").get(0).outerHTML;
    ic = 1;
    $(".replyContainer").hide();
    //$("#posts").hide();
    $(".makepost").hide();
    $("#darken").hide();
    var uid = 0;
    var usernem = "";
    var pageNo = 1;
    var showncomments = [];
    getPosts(pageNo);

    // $("#posts").on("click", function() {
    //     let pg = $("#page").val();
    //     getPosts(pg);
    // });
    function formatDate(str){
        // 2023-12-30 00:01:02
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        str=str.split(' ');
        // ['2023-12-30' , '00:01:02']
        let date = str[0].split('-');
        // date = ['2023' , '12' , '30]
        let time = str[1].split(':');
        // time = ['00' , '01' ,'02']
        if (time[0]>=12){
            time[0]-=12;
            time[2]=' PM';
        } else {
            time[2]=' AM';
        }
        date[2] = parseInt(date[2]);
        date = months[date[1]-1]+'. '+date[2]+', '+date[0];
        time = ' at '+time[0]+':'+time[1]+time[2];
        return date + ' ' + time;
    }

    function convertDate(str){
        str=str.split(' ');
        let date = str[0].split('-');
        let time = str[1].split(':');
        time[0]=parseInt(time[0])+15;
        if (time[0]>=24){
            time[0]-=24;
            date[2]=parseInt(date[2])+1;
        }
        //time[2]=":"+time[2];
        date = date[0]+'-'+date[1]+'-'+date[2];
        time = time[0]+':'+time[1]+':'+time[2];
        return formatDate(date+' '+time);
    }
    
    function getPosts(pageNo){
        //console.log(showncomments);
        inputData = {page: pageNo};
        $("#page").attr("placeholder",pageNo);
        $("#page").val("");
        //alert("ey");
        $.ajax({
            type: "GET",
            url:`http://hyeumine.com/forumGetPosts.php`,
            data: inputData,
            dataType: "html",
            success: function(result) {
                console.log(result);
                result = JSON.parse(result);
                $(".postcol").html("");
                $(".postcol").append(cardheader);
                $(".postcol").show();
                for (let p of result) {
                    let postid = p.id;
                    let user = p.user;
                    
                    ic = p.uid % 32;
                    user = user.replaceAll("<","‹");
                    user = user.replaceAll(">","›");
                    let post = p.post;
                    post = post.replaceAll("<","‹");
                    post = post.replaceAll(">","›");
                    let date = convertDate(p.date);
                    let delid = p.uid;
                    if(post == "") continue;
                    if(user == "") user = "Anonymous";
                    $(".postcol").append(eval('`' + posts + '`'));
                    try {
                        for (let i = p.reply.length-1; i>=0; i--) {
                            user = p.reply[i].user;
                            user = user.replaceAll("<","‹");
                            user = user.replaceAll(">","›");
                            let reply = p.reply[i].reply;
                            reply = reply.replaceAll("<","‹");
                            reply = reply.replaceAll(">","›");
                            date = convertDate(p.reply[i].date);
                            delid = p.reply[i].uid;
                            ic=delid%32;
                            let postrid = p.reply[i].id;
                            $(".postcol").append(eval('`' + replies.replace("ya","replies"+postid) + '`'));
                        }
                    } catch {
                        user = "No Comments";
                        reply = "";
                        date = "";
                        
                        let postrid = "lol";
                        $(".postcol").append(eval('`' + replies.replace("ya","replies"+postid) + '`'));
                        $(".replies"+postid).children("div").children("div").children("img").remove();
                        $(".replies"+postid).children("div").children("div").children("button").remove();
                    }
                    $(".postcol").append(eval('`' + wcomments.replace("xa","reply"+postid) + '`'));
                    if(!(showncomments.includes(postid))) $(".replies"+postid).toggle();
                    $(".reply"+postid).toggle();
                    $(".delbtn").hide();
                    $(".del"+uid).show();
                }
            }
        });
    }

    $("#signup").on("click", function() {
        let first = $("#first").val();
        newUser(first);
    });

    function newUser(user) {
        inputData = {username: user};
        $.ajax({
            type: "POST",
            url: `http://hyeumine.com/forumCreateUser.php`,
            data: inputData,
            dataType: "html",
            success: function(result) {
                console.log(result);
                return JSON.parse(result);
            }
        });
    }

    $("#login").on("click", function() {
        let first = $("#first").val();
        login(first);
    });

    function login(user) {
        inputData = {username: user};
        $.ajax({
            type: "POST",
            url: `http://hyeumine.com/forumLogin.php`,
            data: inputData,
            dataType: "html",
            success: function(result) {
                console.log(result);
                result = JSON.parse(result);
                uid = result.user.id;
                usernem = result.user.username;
                $("#usernameDisplay").html(usernem);
                $("#userPFP").attr("src","icons/" + uid%32 + ".png");
                toggleSidebar();
                getPosts(pageNo);
                return result;
            }
        });
    }

    $("#addPost").on("click", function() {
        newPost($("#newPost").val());
        togglePost();
    });

    function newPost(content) {
        inputData = {post: content, id: uid};
        console.log(inputData);
        $.ajax({
            type: "POST",
            url: `http://hyeumine.com/forumNewPost.php`,
            data: inputData,
            dataType: "html",
            success: function(result) {
                result = JSON.parse(result);
                pageNo=1;
                getPosts(pageNo);
                console.log("THE RESULT");
                console.log(result);
                //let user = usernem;
                // user = user.replaceAll("<","‹");
                // user = user.replaceAll(">","›");
                // let post = content;
                // post = post.replaceAll("<","‹");
                // post = post.replaceAll(">","›");
                // let date = "Just now";
                // //if(post == "") continue;
                // if(user == "") user = "Unregistered User";
                // $("#posts").prepend(eval('`' + posts + '`'));
                return result;
            }
        });
    }

    $(".postcol").on("click", "#delete", function () {
        let id = $(this).children($("p")).html();
        deletePost(id);
    });
    function deletePost(postID) {
        inputData = {id: postID};
        $.ajax({
            type: "GET",
            url: `http://hyeumine.com/forumDeletePost.php`,
            data: inputData,
            dataType: "html",   
            success: function(result) {
                getPosts(pageNo);
                return JSON.parse(result);
            }
        });
    }

    $(".postcol").on("click", "#deleteReply", function () {
        let id = $(this).children($("p")).html();
        //alert("like button");
        console.log(id);
        deleteReply(id);
    });
    function deleteReply(replyID) {
        inputData = {id: replyID};
        $.ajax({
            type: "GET",
            url: `http://hyeumine.com/forumDeleteReply.php`,
            data: inputData,
            dataType: "html",   
            success: function(result) {
                getPosts(pageNo);
                console.log(result);
                return JSON.parse(result);
            }
        });
    }

    var sidebar=false;
    $("#showSidebar").on("click",function(){
        toggleSidebar();
    });

    function toggleSidebar(){
        if(sidebar){
            $(".loginbox").css({"right":"-40%"});
            $(".loginbox").css({"display":"block"});
            sidebar=false;
        }else{
            $(".loginbox").css({"right":"2rem"});
            sidebar=true;
        }
    }

    var make = false;
    $("#makePostIcon").on("click",function() {
        togglePost();
    });
    $("#closeButton").on("click",function() {
        togglePost();
    });
    // $("#darken").on("click",function() {
    //     let x=true;
    //     $(".makepost").on("click",function() {
    //         x=false;
    //     });
    //     if(x) togglePost();
    // });
    function togglePost() {
        if (!make) {
            $("#newPost").val("");
            $(".makepost").fadeIn(250);
            $("#darken").fadeIn(250);
            make = true;// <-lol bali  ngano bali mn ay lol
        } else {
            $(".makepost").fadeOut(500);
            $("#darken").fadeOut(550);
            make = false;
        }
    }

    var reply = false;
    $(".replyContainer").hide();
    $(".seeCom").on("click", function() {
        if (reply) {
            $(".replyContainer").hide();
            reply = false;
        } else {
            $(".replyContainer").show();
            reply = true;
        }
        
    })

    var write = false;
    $(".writeComment").hide();
    $(".writeCom").on("click", function() {
        if (write) {
            $(".writeComment").hide();
            write = false;
        } else {
            $(".writeComment").show();
            write = true;
        }
    })
    $(".postcol").on("click", "#closeButton", function () {
        let id = $(this).children($("p")).html();
        $(".reply"+id).toggle();
    });
    $(".postcol").on("click", ".postButton", function () {
        let id = $(this).children($("p")).html();
        let text = $(".replytext"+id).val();
        replyTo(id,text);
        
    });
    function replyTo(postid,replyContent){
        inputData = {user_id: uid, post_id: postid, reply:replyContent};
        console.log(inputData);
        $.ajax({
            type: "POST",
            url:`http://hyeumine.com/forumReplyPost.php`,
            data: inputData,
            dataType: "html",
            success: function(result){
                console.log(result);
                result=JSON.parse(result);
                if(!showncomments.includes(postid)) {
                    showncomments.push(postid);
                }
                getPosts(pageNo);
                return result;
            }
        });
    }
    $(".postcol").on("click", ".writeCom", function () {
        let id = $(this).children($("p")).html();
        $(".reply"+id).toggle();
    });
    $(".postcol").on("click", ".seeCom", function () {
        let id = $(this).children($("p")).html();
        $(".replies"+id).toggle();
        
        if(showncomments.includes(id)){
            let index = showncomments.indexOf(id);
            if (index !== -1) {
                showncomments.splice(index, 1);
            }
        } else {
            showncomments.push(id);
        }
    });

    $("#prev").on("click", function() {
        if (pageNo > 1) {
            getPosts(--pageNo);
        }
    })
    $("#next").on("click", function() {
        getPosts(++pageNo);
    })
    $("#page").keypress(function(e) {
        pageNo = $("#page").val();
        if(e.which == 13) {         
            getPosts(pageNo);
        }
    });

});