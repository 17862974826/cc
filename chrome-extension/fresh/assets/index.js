(function($){

    var switchNode = $('#J_swicth_btn'),
        reload = $('#J_Reload'),
        monitorFiles = [];

    var chromeObj = {
        init: function(){
            this._initData();
            this._switch();
        },
        // ���ݳ�ʼ��
        _initData: function(){
            var _self = this;
            // ע��content
            chrome.windows.getCurrent(function (currentWindow) {
                chrome.tabs.query({ active: true, windowId: currentWindow.id }, function (activeTabs) {
                    // ҳ���е�iframe��ִ��
                    chrome.tabs.executeScript(activeTabs[0].id, { file: 'assets/content.js', allFrames: false });
                });
            });

            // �ص����� -- �������յ���Ϣ 
            chrome.extension.onMessage.addListener(function (message) {
                // �ж�ҳ���localStorage �� link script ��ǩ
                if(message.localStg.request > 0){
                    switchNode.addClass('on');
                }
                // ��ʾlink script url
                _self._appendResource($('#J_Links'), message, 'links');
                _self._appendResource($('#J_Scripts'), message, 'scripts');
                $('#J_Current_URL').html(message.location.href);

                message.localStg.files && $.merge(monitorFiles, message.localStg.files.split(','));
                // ע�����¼�
                _self._chkBox();
            });
        },
        _appendResource: function(container, message, id){
            // �����
            container.html('');
            var _self = this,
                monitorArr = [];
                // ���ڼ�ص��ļ�
            if(message.localStg.files)
                monitorArr = message.localStg.files.split(',');
            $(message[id]).each(function(i, file){

                // �жϱ����ļ�
                var li = '<li class="file-item"><input type="checkbox" id="'+id + '_' + i + '" class="chkbox ';
                if($.inArray(file,monitorArr) > -1){
                    li+= 'chkbox-current';
                }
                
                if(_self._isLocal(file, message.location)){
                    li += '"><label for="' + id + '_' + i + '" class="local-file J_Local">' + file;
                }else{
                    li += '"><label for="' + id + '_' + i + '" class="J_Remote">' + file;
                }
                li += '</label></li>';
                container.append(li);
                $('.chkbox-current').prop('checked',true);
            });
        },
        _isLocal: function(file, location){
            var reg = new RegExp("^\\.|^\/(?!\/)|^[\\w]((?!://).)*$|" + location.protocol + "//" + location.host);
            return file.match(reg);
        },
        _switch: function(){
            var _self = this;
            reload.on('click', function(e){
                // e.preventDefault();
                // ����page��sessionStorage
                var code = 'sessionStorage["init-file-links"] = "";'+
                           'sessionStorage["init-file-scripts"] = "";'+
                           'document.location.reload();';
                chrome.tabs.executeScript(null, {code: code});
                // ���������
                _self._initData();
            });
            

            // switch
            switchNode.on('click', function(){
                $(this).toggleClass('on');
                if($(this).hasClass('on')){
                    // ��������
                    var code = 'localStorage["send_head_request"] = 1'
                    chrome.tabs.executeScript(null, {code: code});
                }else {
                    // �رղ���
                    var code = 'localStorage["send_head_request"] = -1'
                    chrome.tabs.executeScript(null, {code: code});
                }
            });
        },
        _chkBox: function(){
            $('.chkbox').on('change', function(){
                if($(this).prop('checked')){
                    // ��䵽ҳ��
                    var file = $(this).addClass('chkbox-current').siblings().html();
                    monitorFiles.push(file);
                    var code = 'localStorage["monitor_files"] = ' + '"' + monitorFiles + '"';
                    chrome.tabs.executeScript(null, {code: code});
                }else {
                    $(this).removeClass('chkbox-current');
                    // ɾ���ļ�
                    monitorFiles.splice($.inArray($(this).siblings().html(),monitorFiles),1);

                    var code = 'localStorage["monitor_files"] = ' + '"' + monitorFiles + '"';
                    chrome.tabs.executeScript(null, {code: code});
                }
            });
        }
    }

    chromeObj.init();

})(jQuery);

