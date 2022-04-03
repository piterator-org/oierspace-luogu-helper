// ==UserScript==
// @name           OIer Space Luogu Helper
// @author         Piterator
// @namespace      https://oier.space/
// @description    Safely and quickly import articles into OIer Space.
// @description:zh 安全且快速地导入文章到 OIer Space
// @iconURL        https://static.pisearch.cn/logonew.min.svg
// @icon64URL      https://static.pisearch.cn/logonew.min.svg
// @version        1.1.3
//
// @match          https://www.luogu.com.cn/blogAdmin*
//
// @connect        oier.space
// @connect        www.luogu.com.cn
//
// @require        https://lf6-cdn-tos.bytecdntp.com/cdn/expire-1-M/jquery/3.6.0/jquery.min.js
//
// ==/UserScript==

function getQueryString(name) {
    let r = window.location.search.substr(1).match(new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"))
    if (r != null) return unescape(r[2])
    return null
}

if (window.location.pathname == "/blogAdmin/article/list" && getQueryString("pageType") == "list") {
    let maindiv = document.getElementsByTagName("main")[0].children[0]
    maindiv.innerHTML = `<div id="import-log"></div><br><div class="mdui-textfield mdui-center mdui-textfield-not-empty" style="padding: 0;">
        <label class="mdui-textfield-label">OIer Space 用户令牌</label>
        <div class="mdui-row">
            <div class="mdui-col-xs-1"><a class="mdui-btn mdui-color-theme-accent mdui-ripple mdui-btn-block"
                    href="https://oier.space/dashboard/tokens/" target="_blank">获取令牌</a></div>
            <div class="mdui-col-xs-5">
                <input name="user_token" id="user_token" class="mdui-textfield-input" type="text"
                    placeholder="OIer Space 用户令牌">
            </div>
            <div class="mdui-col-xs-6">
                <label class="mdui-checkbox">
                    <input type="checkbox" id="replace" checked>
                    <i class="mdui-checkbox-icon"></i>
                    更新文章而不是重复导入（若有）
                </label>
            </div>
        </div>
    </div><br>` + maindiv.innerHTML
    let tbody = document.getElementsByTagName("tbody")[0]
    for (let i = 0; i < tbody.childElementCount; ++i) {
        tbody.children[i].children[1].innerHTML = `<button class="mdui-btn mdui-color-theme-accent mdui-ripple import-btn"
            blog-id="${ tbody.children[i].getAttribute("blog-id") }" blog-category="${ tbody.children[i].children[2].innerHTML }"
            blog-title="${ tbody.children[i].children[1].children[0].innerHTML }" id="import-btn-${ tbody.children[i].getAttribute("blog-id") }"
            >导入到 OIer Space</button>&ensp;${ tbody.children[i].children[1].innerHTML }`
    }
    $(".import-btn").each(function () {
        $(this).click(() => {
            let imlog = document.getElementById("import-log")
            let slug = "", content = ""
            let id = $(this).attr("blog-id")
            let category = $(this).attr("blog-category")
            let title = $(this).attr("blog-title")
            $.get(`https://www.luogu.com.cn/blogAdmin/article/edit/${ $(this).attr("blog-id") }`,
            function (data, status) {
                if (data.indexOf("<title>出错了 - 洛谷</title>") != -1) {
                    imlog.innerHTML = `<span style="color: #6200ea">文章 ${ title } 导入失败！失败原因：请求繁忙（出错了 - 洛谷）<span><br>`
                } else {
                    let s_hnts = `<input name="identifier" class="mdui-textfield-input"
                           type="text" placeholder="可根据标题自动生成"
                           value="`,
                        s_hnte = `"`
                    let s_s = data.indexOf(s_hnts) + s_hnts.length, s_e = data.indexOf(s_hnte, s_s)
                    slug = data.substring(s_s, data.length).substr(0, s_e - s_s)

                    let c_hnts = `var articleContent = "`,
                        c_hnte = `";
        /*var articleEditor = editormd('article-editor', {`
                    let c_s = data.indexOf(c_hnts) + c_hnts.length, c_e = data.indexOf(c_hnte, c_s)
                    content = data.substring(c_s, data.length).substr(0, c_e - c_s)

                    $.post(`https://oier.space/api/luogu/import.json`,
                    {
                        "token": $("#user_token").val(),
                        "id": id,
                        "category": category,
                        "title": title,
                        "identifier": slug,
                        "articleContent": eval(`\`${ content.replace(/`/g, "\\`") }\``),
                        "replace": ($("#replace").prop('checked') ? "true" : "flase")
                    }, function (data, status) {
                        if (data["status"] == "succeed") {
                            $(`#import-btn-${ id }`).attr("disabled", "disabled")
                            imlog.innerHTML = `<span style="color: #009b08">文章 ${ title } 导入成功！<span><br>`
                        } else {
                            console.log(data)
                            imlog.innerHTML = `<span style="color: #f12e41">文章 ${ title } 导入失败！失败原因：${ data["error"] }<span><br>`
                        }
                    })
                }
            })
        })
    })
    $("a[data-target-page]").each(function () {
        $(this).click(() => {
            window.location.href = `https://www.luogu.com.cn/blogAdmin/article/list?pageType=list&page=${ $(this).attr("data-target-page") }`
        })
    })
}
