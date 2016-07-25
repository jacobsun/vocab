var Vocab = (function() {
    'use strict'
    var obj = {}
    obj.doms = {}
    obj.init = function() {
        var injectCss = function() {
            var style = document.createElement('link')
            var url = chrome.extension.getURL("css/content.css");
            style.setAttribute('href', url)
            style.setAttribute('rel', 'stylesheet')
            document.getElementsByTagName('head')[0].appendChild(style)
        }

        var injectContainer = function() {
            var short = document.createElement('p'),
                word = document.createElement('h1'),
                long = document.createElement('p'),
                info = document.createElement('p'),
                dict = document.createElement('div'),
                wrapper = document.createElement('div')

            wrapper.className = 'bacov-vocab-wrapper'
            short.className = 'bacov-vocab-short'
            long.className = 'bacov-vocab-long'
            info.className = 'bacov-vocab-info'

            info.innerHTML = 'Text from Vocabulary.com (https://www.vocabulary.com), Copyright ©1998-2016 Thinkmap, Inc. All rights reserved.'

            dict.appendChild(word)
            dict.appendChild(short)
            dict.appendChild(long)

            wrapper.appendChild(dict)
            wrapper.appendChild(info)
            document.body.appendChild(wrapper)
            obj.doms.wrapper = wrapper
            obj.doms.short = short
            obj.doms.long = long
            obj.doms.word = word
            reset()
        }

        injectCss()
        injectContainer()
    }

    obj.display = function(result) {
        //current selected texts, maybe not the texts searched in server
        var _maybe_word = getSelectedText()

        if (result.error) {
            Vocab.doms.word.innerHTML = _maybe_word
            Vocab.doms.short.innerHTML = 'Error!'

        } else if (result.noresults) {

            Vocab.doms.word.innerHTML = _maybe_word
            Vocab.doms.short.innerHTML = "Sorry! Ain't got what you want." + '<p class="more"><a target="_blank" href="https://www.vocabulary.com/dictionary/' + _maybe_word + '">I am feeling LUCKY!</a></p>'

        } else {
            Vocab.doms.word.innerHTML = result.word
            Vocab.doms.short.innerHTML = result.short
            Vocab.doms.long.innerHTML = result.long + '<p class="more"><a target="_blank" href="https://www.vocabulary.com/dictionary/' + result.word + '">I found the WATER!</a></p>'
        }


    }

    obj.searching = function() {
        Vocab.doms.wrapper.id = 'bacov-vocab-show'
        Vocab.doms.word.innerHTML = 'Searching...'

        Vocab.doms.wrapper.style.left = window.pageXOffset + window.innerWidth / 2 - Vocab.doms.wrapper.offsetWidth / 2 + 'px'
        Vocab.doms.wrapper.style.top = window.pageYOffset + (window.innerHeight - Vocab.doms.wrapper.offsetHeight) / 6 + 'px'
        document.body.addEventListener('click', closeUi, false)
        Vocab.doms.wrapper.addEventListener('click', function(e) {
            e.stopPropagation()
        }, false)

    }

    function closeUi() {
        reset()
        document.body.removeEventListener('click', closeUi, false)
    }

    function reset() {
        Vocab.doms.wrapper.id = 'bacov-vocab-hide'
        Vocab.doms.word.innerHTML = ''
        Vocab.doms.short.innerHTML = ''
        Vocab.doms.long.innerHTML = ''
    }

    return obj
}())

window.onload = function() {
    Vocab.init()

    chrome.runtime.onMessage.addListener(function(msg, _, sendResponse) {
        if (msg.searching) {
            Vocab.searching()
        }

        if (msg.result) {
            Vocab.display(msg.result)
        }
    })

    document.body.addEventListener('dblclick',function(){
        var word = getSelectedText()
        if(!word) return
        chrome.runtime.sendMessage({word: word});
    })
}

function getSelectedText(){
    var word = window.getSelection().toString()
    return word.replace(/[^a-zA-Z]/g, "")
}
