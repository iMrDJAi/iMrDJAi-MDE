window.mrdjaEmbeds = async function (img) { //So for markdown we will use the image syntex to render embeds, giving an invalid image url will emit the error event, that's why we added that function as the "onerror" attribute value.
    if (img.isConnected) {
        var url = img.attributes.src.value; //Get the url.
        if (!url.match(/^[a-zA-Z]+:\/\//)) {
            url = "http://" + url;
            img.setAttribute('src', url);
        } else if (/^((http|https):\/\/)?(www.)?(youtube.com\/|youtu.be\/|youtube-nocookie.com\/)/i.test(url) && /(\/|%3D|v=)([0-9A-z-_]{11})([%#?&]|$)/i.test(url)) { //Youtube embeds!
            var p = img;
            while (p.nodeName !== "BODY") {
                p = p.parentNode;
                if (p.nodeName === "A") p.removeAttribute('href')
            }
            const id = /(\/|%3D|v=)([0-9A-z-_]{11})([%#?&]|$)/i.exec(url)[2];
            const embed = document.createElement("div");
            embed.setAttribute('class', '_EMBED_iframe');
            embed.setAttribute('style', 'max-width: 650px');
            if (/^((http|https):\/\/)?(www.)?(youtube-nocookie.com)/i.test(url)) {
                embed.innerHTML = `
                    <svg viewBox="0 0 16 9"></svg>
                    <iframe src="https://www.youtube-nocookie.com/embed/${id}" style="height: 100%; width: 100%;" allowfullscreen="" allow="encrypted-media" frameborder="0"></iframe>
                `;
            } else { 
                embed.innerHTML = `
                    <svg viewBox="0 0 16 9"></svg>
                    <iframe src="https://www.youtube.com/embed/${id}" style="height: 100%; width: 100%;" allowfullscreen="" allow="encrypted-media" frameborder="0"></iframe>
                `;
            }
            img.replaceWith(embed);
        } else if (/^((http|https):\/\/)?(open.spotify.com\/)/i.test(url) && /\/(track|album|artist|playlist)(\/[A-Za-z0-9]{22})/i.test(url)) { //Spotify embeds!
            var p = img;
            while (p.nodeName !== "BODY") {
                p = p.parentNode;
                if (p.nodeName === "A") p.removeAttribute('href')
            }
            const id = /\/(track|album|artist|playlist)(\/[A-Za-z0-9]{22})/i.exec(url)[0];
            const embed = document.createElement("iframe");
            embed.setAttribute('class', '_EMBED_iframe');
            embed.setAttribute('src', `https://open.spotify.com/embed${id}`);
            embed.setAttribute('frameborder', '0');
            embed.setAttribute('allowtransparency', 'true');
            embed.setAttribute('allow', 'encrypted-media');
            embed.setAttribute('style', 'min-width: 200px; width: 100%; max-width: 300px; height: 380px;');
            img.replaceWith(embed);
        } else if (!await isOnline()) {
            setTimeout(() => {
                if (img.isConnected) img.setAttribute('src', url);
            }, 10000);
        } else {
            embedAPI(url).then(async data => { //Now we will use the API to get the url data.
                if (img.isConnected) {
                    if (!data.error) { //This will deal with errors.
                        if (img.attributes.title) var title = img.attributes.title.value; else var title = ''; //Get the title.
                        if (img.attributes.alt) var alt = img.attributes.alt.value; else var alt = ''; //Get the alt.

                        if (data.contentType.startsWith('image')) { //Slow connection may cause that?
                            img.setAttribute('src', url);
                        } else if (data.contentType.startsWith('video')) { //RoW vIdIeOs BoI!!!
                            var p = img;
                            while (p.nodeName !== "BODY") {
                                p = p.parentNode;
                                if (p.nodeName === "A") p.removeAttribute('href')
                            }
                            const video = document.createElement("video");
                            if (title) video.setAttribute('title', title);
                            video.innerHTML = `<source src="${url}">`;
                            img.replaceWith(video);
                            const player = new Plyr(video);
                            player.elements.container.setAttribute('style', 'max-width: 650px');
                        } else if (data.contentType.startsWith('audio')) { //It's music time!! 🎶
                            var p = img;
                            while (p.nodeName !== "BODY") {
                                p = p.parentNode;
                                if (p.nodeName === "A") p.removeAttribute('href')
                            }
                            const audio = document.createElement("audio");
                            if (title) audio.setAttribute('title', title);
                            audio.innerHTML = `<source src="${url}">`;
                            img.replaceWith(audio);
                            const player = new Plyr(audio);
                            player.elements.container.setAttribute('style', 'max-width: 650px');
                        } else if (data.contentType.startsWith('application')) { //Any other file types?
                            var p = img;
                            while (p.nodeName !== "BODY") {
                                p = p.parentNode;
                                if (p.nodeName === "A") p.removeAttribute('href')
                            }
                            const a = document.createElement("a");
                            a.setAttribute('href', url);
                            img.replaceWith(a);
                        } else { //The hard part, embeds
                            var p = img;
                            while (p.nodeName !== "BODY") {
                                p = p.parentNode;
                                if (p.nodeName === "A") p.removeAttribute('href')
                            }
                            const embed = document.createElement("div"); //Just replace that img tag with a new div that will be used for the embed.
                            embed.classList.add('_EMBED_body'); //It's the time to use the css magic!
                            embed.innerHTML = `<div class="_EMBED_loadingicon mdi mdi-spin mdi-loading"></div>`; //Some loading effects with be a nice touch.
                            img.replaceWith(embed); //Done!
                            let embedData = { //Some checks to return the right and the needed data...
                                image: function () { //The embed image, some times the API gives a valid url and sometimes nope, sometimes there is no image url at all.
                                    if (data.images[0]) { //This will check when there is a url
                                        return data.images[0]; //Now we can use that url on the embed
                                    } else return 'https://i.imgur.com/KCoK3mf.png'; //Yeah we should have an image inside our embed. So.. adding a new one as a placeholer is the solution
                                },
                                favicon: function () { //The favicon, it's the same as the embed image but it's smaller
                                    if (data.favicons[0]) { //We will use the same previous check
                                        return data.favicons[0];
                                    } else return 'https://i.imgur.com/KCoK3mf.png';
                                },
                                description: function () { //The description, it's just the page description..
                                    if (data.description) {
                                        const description = data.description.replace(/\n/g, '<br>'); //We need to include linebreaks, so we have to convert every '\n' to '<br>'.
                                        if (data.siteName) {
                                            return '<h3 style="margin: 5px 0 10px 0;"><u>' + data.siteName + '</u></h3>' + description; //Another value called siteName, I prefer to include it with the description when it's available.
                                        } else {
                                            return description; //ehhhhh just return the description when not..
                                        }
                                    } else return data.mediaType; //No description? the mediaType is enough by the way.
                                },
                                title: function () { //And that's the title!
                                    return data.title || data.siteName || data.url; //Use 'data.title'. no data.title? np! use 'data.siteName'. no 'data.siteName'? np! use 'data.url'. no 'data.url'? nope! 'data.url' will be always there.
                                },
                            };
                            //Now let's just mix everything
                            embed.innerHTML = `
                                <a href="${data.url}" class="_EMBED_image">
                                    <img src="${embedData.image()}" onerror="this.setAttribute('src', 'https://i.imgur.com/KCoK3mf.png');">
                                </a>
                                <div class="_EMBED_info">
                                    <a href="${data.url}" class="_EMBED_icon">
                                        <img src="${embedData.favicon()}" onerror="this.setAttribute('src', 'https://i.imgur.com/KCoK3mf.png');">
                                    </a>
                                    <a href="${data.url}" class="_EMBED_title" title="${embedData.title()}">
                                        ${embedData.title()}
                                    </a>
                                    <div class="_EMBED_description">
                                        ${embedData.description()}
                                    </div>
                                </div>
                            ` //And this is it! we made the embed!
                        }
                    } else if (data.error === 'timeout') {
                        setTimeout(() => {
                            if (img.isConnected) img.setAttribute('src', url);
                        }, 10000);
                    }
                }
            });

            async function embedAPI(url) {
                return new Promise(resolve => {
                    setTimeout(async () => {
                        if (img.isConnected) {                
                            isvalid();
                            async function isvalid() {
                                var a = await urlValidityCheck(url);
                                if (a === "offline") {
                                    isvalid();
                                } else if (a === "invalid") {
                                    resolve({ error: "URL Error" });
                                } else if (a === "valid") {
                                    hasMedia();
                                }
                            }
                            async function hasMedia() {
                                var a = await mediaCheck(url);
                                if (a === "offline") {
                                    hasMedia();
                                } else if (a === "video") {
                                    resolve({ contentType: "video" });
                                } else if (a === "audio") {
                                    resolve({ contentType: "audio" });
                                } else if (a === "none") {
                                    resolve(await serverCheck());
                                }
                            }
                        }
                    }, 1500);
                });
            }
        }

        function isOnline() {
            return new Promise(resolve => {
                setTimeout(function () {
                    resolve(false);
                }, 1000);
                fetch('https://www.googleapis.com', {
                        mode: "no-cors"
                    })
                    .then(() => {
                        resolve(true);
                    })
                    .catch(() => {
                        resolve(false);
                    });
            });
        }

        function urlValidityCheck(url) {
            return new Promise(resolve => {
                setTimeout(function () {
                    resolve("invalid");
                }, 1000);
                fetch(url, {
                        mode: "no-cors"
                    })
                    .then(() => {
                        resolve("valid");
                    })
                    .catch(async () => {
                        if (!await isOnline()) resolve("offline"); else resolve("invalid");
                    });
            });
        }

        function mediaCheck() {
            return new Promise((resolve) => {
                var media = document.createElement("video");
                media.setAttribute("src", url);
                media.addEventListener("canplay", function () {
                    if (media.videoHeight === 0) {
                        resolve("audio");
                    } else if (media.videoHeight > 0) {
                        resolve("video");
                    }
                });
                media.addEventListener("error", async function () {
                    if (!await isOnline()) resolve("offline"); else resolve("none");
                });
            });
        }
        
        function serverCheck() {
            return timeout(5000, fetch(`https://embed-js.glitch.me/api?url=${encode(url)}`))
            .then(function (res) {
                return res.json();
            })
            .catch(function () {
                return { error: "Timeout" };
            });
        }

        function timeout(ms, promise) {
            return new Promise(function (resolve, reject) {
                setTimeout(function () {
                    reject(new Error("timeout"));
                }, ms);
                promise.then(resolve, reject);
            });
        }

        function encode(string) {
            var number = "0x";
            var length = string.length;
            for (var i = 0; i < length; i++)
                number += string.charCodeAt(i).toString(16);
            return number;
        }

        function decode(number) {
            var string = "";
            number = number.slice(2);
            var length = number.length;
            for (var i = 0; i < length;) {
                var code = number.slice(i, (i += 2));
                string += String.fromCharCode(parseInt(code, 16));
            }
            return string;
        }
    }    
}
