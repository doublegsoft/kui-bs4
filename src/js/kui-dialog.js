if (typeof dialog === 'undefined') dialog = {};

dialog.alert = function (message) {
  layer.open({
    type: 0,
    icon: 0,
    offset: '150px',
    shade: 0,
    shadeClose: true,
    title: '警告',
    content: message,
  });
};


dialog.info = function (message) {
  layer.open({
    type: 0,
    offset: '150px',
    shade: 0,
    shadeClose: true,
    title: '信息',
    content: message,
  });
};

/**
 * 支持shadeClose
 */
dialog.info2 = function (message) {
  layer.open({
    type: 0,
    offset: '100px',
    shade: 0.3,
    shadeClose: true,
    title: '信息',
    content: message,
  });
};

dialog.error = function (message) {
  layer.open({
    type: 0,
    icon: 2,
    offset: '150px',
    shade: 0,
    shadeClose: true,
    title: '错误',
    content: message,
  });
};

dialog.success = function (message, callback) {
  if (callback) {
    layer.open({
      type: 0,
      icon: 1,
      offset: '150px',
      shade: 0,
      shadeClose: true,
      title: '成功',
      content: message,
      btn: ['确定', '确定并返回'],
      yes: function (index, layero) {
        layer.close(index);
      },
      btn2: function (index, layero) {
        layer.close(index);
        callback();
      }
    });
  } else {
    layer.open({
      type: 0,
      icon: 1,
      offset: '150px',
      shade: 0,
      shadeClose: true,
      title: '成功',
      content: message
    });
  }
};

dialog.confirm = function (message, callback) {
  layer.confirm(message, {
    title: '确认',
    btn: ['确定', '取消'] //按钮
  }, function (index) {
    layer.close(index);
    callback();
  }, function () {

  });
};

dialog.view = function (opts) {
  let dialogTemplate = '' +
    '<div class="modal fade" id="dialogApplication">' +
    '  <div class="modal-dialog modal-dialog-centered">' +
    '    <div class="modal-content">' +
    '      <div class="modal-header">' +
    '        <h4 class="modal-title">{{title}}</h4>' +
    '        <button type="button" class="close" data-dismiss="modal">&times;</button>' +
    '      </div>' +
    '      <div id="dialogApplicationBody" class="modal-body">{{body}}</div>' +
    '      <div class="modal-footer">' +
    '        {{#each buttons}}' +
    '        <button type="button" class="btn {{class}}" data-dismiss="modal">{{text}}</button>' +
    '        {{/each}}' +
    '        <button type="button" class="btn btn-close" data-dismiss="modal">关闭</button>' +
    '      </div>' +
    '    </div>' +
    '  </div>' +
    '</div>';
  let title = opts.title;
  let url = opts.url;
  let body = $(document.body);

  if ($('#dialogApplication').length)
    $('#dialogApplication').remove();

  let buttons = [];
  if (opts.save) {
    buttons.push({
      text: '保存',
      class: 'btn-save',
      success: opts.save
    })
  }
  $.ajax({
    url: url,
    success: function (resp) {
      let template = Handlebars.compile(dialogTemplate);
      let html = template({
        title: title,
        body: resp,
        buttons: buttons
      });
      $(document.body).append(html);
      $('#dialogApplication').modal('show');
    }
  });
};

dialog.select = function(opts) {
  ajax.view({
    url: opts.url,
    success: function(resp) {
      layer.open({
        type: 0,
        icon: 1,
        offset: '150px',
        shade: 0.5,
        shadeClose: true,
        title: opts.title,
        content: resp
      });
    }
  });
};