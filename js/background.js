// Ajax method helper
var Ajax = (function() {
    'use strict'
    var method = {}
    var TYPES = [
        'arraybuffer',
        'blob',
        'document',
        'json',
        'text'
    ]
    var xhr = new XMLHttpRequest()
    method.request = function(params, headers) {
        var verb = params.method || 'Get'
        var type = params.responseType || 'text'
        xhr.open(verb, params.uri, true)
        Object.keys(headers).forEach(function(key) {
            xhr.setRequestHeader(key, headers[key])
        })
        xhr.responseType = TYPES.indexOf(type) > -1 ? type : 'text'
        return this
    }
    method.response = function(callback) {
        var that = this
        xhr.onreadystatechange = function() {
            that.handle(callback)
        }
        return this
    }
    method.send = function() {
        xhr.send(null)
    }
    method.handle = function(callback) {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var result = xhr.response
            callback(result)
        }
    }
    return method
}())

var Vocab = (function() {
    var obj = {}
        // tab that called the extension
    obj.API = 'http://app.vocabulary.com/app/1.0/dictionary/search?word='
    obj.currentTab = -1

    chrome.contextMenus.create({
        title: 'Call vocabulary.com',
        id: '#lookup',
        contexts: ['selection'],
    })

    chrome.contextMenus.onClicked.addListener(function(info) {
        chrome.tabs.query(
            {active: true,currentWindow: true},
            function(tabs) {
                obj.currentTab = tabs[0].id
                createUi()
                var word = info.selectionText.replace(/[^a-zA-Z]/g, '')
                search(word)
            })
    })

    chrome.runtime.onMessage.addListener(function(msg, sender, callback){
        obj.currentTab = sender.tab.id
        createUi()
        search(msg.word)
    })

    function search(word) {

        var url = Vocab.API + word
        Ajax
            .request({
                method: 'Get',
                uri: url,
                responseType: 'document'
            }, {
                Accept: 'text/html'
            })
            .response(makeResult)
            .send()
    }

    function makeResult(result) {
        var res = {}
        if (!result) {
            res.error = true
        } else if (result.querySelector('.noresults')) {
            res.error = false
            res.noresults = true
        } else if (!result.querySelector('.blurb')) {
            res.error = false
            res.noresults = true
        } else {
            res.error = false
            res.noresults = false
            res.word = result.querySelector('.wordPage').getAttribute('data-word')
            res.short = result.querySelector('.short').textContent
            res.long = result.querySelector('.long').textContent
        }
        chrome.tabs.sendMessage(obj.currentTab, {
            result: res
        });
    }

    function createUi(){
        chrome.tabs.sendMessage(obj.currentTab, {
            searching: true
        })
    }

    return obj
}());
