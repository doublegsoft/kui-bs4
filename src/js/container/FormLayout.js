let ICON_REQUIRED = '<i class="fas fa-asterisk icon-required"></i>';
let ICON_GENERAL = '<i class="fas fa-question icon-general"></i>';
let ICON_CORRECT = '<i class="fas fa-check text-success" style="width: 10px;"></i>';
let ICON_ERROR = '<i class="fas fa-exclamation text-warning" style="width: 10px;"></i>';

function FormLayout(opts) {
  let self = this;
  this.fields = opts.fields;
  this.readonly = opts.readonly || false;
  this.actions = opts.actions || [];
  this.columnCount = opts.columnCount || 2;
  this.saveOpt = opts.save;
  this.readOpt = opts.read;
  this.toast = dom.element(`
    <div class="toast fade b-a-1 text-white" data-autohide="false" 
         style="position: absolute; left: 20%; top: 10px; width: 60%; z-index: -1;">
      <div class="toast-header pt-1">
        <strong class="mr-auto p-2"></strong>
        <button type="button" class="ml-2 mb-1 mr-2 close text-white" data-dismiss="toast">&times;</button>
      </div>
      <div class="toast-body p-2"></div>
    </div>
  `);
  this.controls = {};

  dom.find('button', this.toast).addEventListener('click', function(event) {
    event.preventDefault();
    event.stopPropagation();
    self.toast.classList.remove('show', 'in');
    self.toast.style.zIndex = -1;
  });
}

/**
 * Renders the form in page.
 *
 * @param containerId
 *        the container selector or itself
 *
 * @param params
 *        the request parameters
 */
FormLayout.prototype.render = function (containerId, params) {
  this.containerId = containerId;
  if (typeof containerId === 'string') {
    this.container = document.querySelector(containerId);
  } else {
    this.container = containerId;
  }
  this.container.innerHTML = '';

  this.fetch(params);
};

/**
 * Builds the form.
 *
 * @param persisted
 *        the persisted data which is fetching from remote data
 *
 * @private
 */
FormLayout.prototype.build = function(persisted) {
  let self = this;
  persisted = persisted || {};
  let form = dom.create('div', 'col-md-12', 'form-horizontal');
  let columnCount = this.columnCount;
  let hiddenFields = [];
  let shownFields = [];
  for (let i = 0; i < this.fields.length; i++) {
    let field = this.fields[i];
    // make default value working
    if (!field.value) {
      if (field.name.indexOf("[]") != -1) {
        let name = field.name.substring(0, field.name.indexOf('[]'));
        field.value = (typeof persisted[name] === 'undefined' || persisted[name] == 'null') ? null : persisted[name];
      } else if (field.name.indexOf('.') != -1) {
        let parentName = field.name.substring(0, field.name.indexOf('.'));
        let childName = field.name.substring(field.name.indexOf('.') + 1);
        field.value = (typeof persisted[parentName] === 'undefined' || persisted[parentName] == 'null') ? null :
            (typeof persisted[parentName][childName] === 'undefined' || persisted[childName] == 'null') ? null : persisted[parentName][childName];
      } else {
        field.value = (typeof persisted[field.name] === 'undefined' || persisted[field.name] == 'null') ? null : persisted[field.name];
      }
    }
    if (field.input == 'hidden') {
      hiddenFields.push(field);
    } else {
      shownFields.push(field);
    }
  }

  let rows = [];
  let len = shownFields.length;
  for (let i = 0; i < shownFields.length; i++) {
    let field = shownFields[i];
    rows.push({
      first: field,
      second: (i + 1 < len) ? shownFields[i + 1] : null
    });
    if (columnCount == 2)
      i += 1;
  }

  // hidden fields
  for (let i = 0; i < hiddenFields.length; i++) {
    let field = hiddenFields[i];
    let hidden = dom.create('input');
    hidden.type = 'hidden';
    hidden.name = field.name;
    hidden.value = field.value;
    hidden.setAttribute('data-identifiable', field.identifiable || false);
    form.appendChild(hidden);
  }

  // shown fields
  for (let i = 0; i < rows.length; i++) {
    let row = rows[i];
    let formGroup = dom.create('div', 'form-group', 'row');
    let group = this.createInput(row.first, columnCount);

    if (group.label) {
      formGroup.appendChild(group.label);
    }
    formGroup.appendChild(group.input);

    if (columnCount == 2 && row.second) {
      group = this.createInput(row.second);
      formGroup.appendChild(group.label);
      formGroup.appendChild(group.input);
    }
    form.appendChild(formGroup);
  }
  // 必须放在这里，否者后续容器会找不到
  this.container.appendChild(form);
  this.container.appendChild(this.toast);

  // ###################### //
  // 引用的第三方插件，重新渲染 //
  // ###################### //
  for (let i = 0; i < this.fields.length; i++) {
    let field = this.fields[i];
    if (field.input == 'date') {
      $(this.container).find('input[name=\'' + field.name + '\']').datetimepicker({
        format: 'YYYY-MM-DD',
        locale: 'zh_CN',
        useCurrent: false
      });
      // 加载值或者默认值
      if (field.value != null) {
        dom.find('input[name=\'' + field.name + '\']', this.container).value = moment(field.value).format('YYYY-MM-DD');
      }
    } else if (field.input == 'datetime') {
      $(this.container).find('input[name=\'' + field.name + '_date\']').datetimepicker({
        format: 'YYYY-MM-DD',
        locale: 'zh_CN',
        useCurrent: false
      });
      // 加载值或者默认值
      if (field.value != null) {
        dom.find('input[name=\'' + field.name + '_date\']', this.container).value = moment(field.value).format('YYYY-MM-DD');
      }

      $(this.container).find('input[name=\'' + field.name + '_time\']').datetimepicker({
        format: 'HH:mm:00',
        locale: 'zh_CN',
        useCurrent: false
      });
      // 加载值或者默认值
      if (field.value != null) {
        dom.find('input[name=\'' + field.name + '_time\']', this.container).value = moment(field.value).format('HH:mm:00');
      }
    } else if (field.input == 'time') {
      $(this.container).find('input[name=\'' + field.name + '\']').datetimepicker({
        format: 'hh:mm:00',
        locale: 'zh_CN',
        useCurrent: false
      });
      // 加载值或者默认值
      if (field.value != null) {
        dom.find('input[name=\'' + field.name + '\']', this.container).value = moment(field.value).format('hh:mm:00');
      }
    } else if (field.input == 'select') {
      let opts = field.options;
      opts.validate = FormLayout.validate;
      // 加载值或者默认值
      // 允许数组值
      if (Array.isArray(field.value)) {
        opts.selection = field.value[0][opts.fields.value];
      } else {
        opts.selection = field.value;
      }
      this.controls[field.name] = $(this.container).find('select[name=\'' + field.name + '\']').searchselect(opts);
    } else if (field.input == 'cascade') {
      let opts = field.options;
      opts.validate = FormLayout.validate;
      // 加载值或者默认值
      for (let j = 0; j < opts.levels.length; j++) {
        let level = opts.levels[j];
        if (typeof persisted[level.name] !== "undefined") {
          level.value = persisted[level.name];
        }
      }
      opts.required = field.required || false;
      if (this.readonly == true) {
        opts.readonly = true;
      }
      if (field.readonly == true) {
        opts.readonly = true;
      }
      $(this.container).find('div[data-cascade-name=\'' + field.name + '\']').cascadeselect(opts);
    } else if (field.input == 'checklist') {
      if (this.readonly == true) {
        field.options.readonly = true;
      }
      if (field.readonly == true) {
        field.options.readonly = true;
      }
      field.options.name = field.name;
      this.params = this.params || {};
      field.options.data = field.options.data || {};
      for (let key in this.params) {
        field.options.data[key] = this.params[key];
      }
      new Checklist(field.options).render(dom.find('div[data-checklist-name=\'' + field.name + '\']', this.container), {
        selections: persisted[field.name] || []
      });
    } else if (field.input == 'checktree') {
      field.options.name = field.name;
      field.options.readonly = this.readonly;
      this.params = this.params || {};
      field.options.data = field.options.data || {};
      for (let key in this.params) {
        field.options.data[key] = this.params[key];
      }
      // new Checktree(field.options).render('#checktree_' + field.name);
      this[field.name] = new TreelikeList(field.options);
      this[field.name].render(dom.find('div[data-checktree-name=\'' + field.name + '\']', this.container), field.value);
      // this[field.name].setValues(field.value);
    } else if (field.input == 'fileupload') {
      new FileUpload(field.options).render(dom.find('div[data-fileupload-name=\'' + field.name + '\']', this.container));
    } else if (field.input == 'longtext') {
      if (field.language === 'javascript') {
        let textarea = dom.find(containerId + ' textarea[name=\'' + field.name + '\']');
        let cm = CodeMirror.fromTextArea(textarea, {
          mode: 'javascript',
          lineNumbers: true,
          height: 420,
          background: '#565656'
        });
        cm.on('keyup', function(cm, what) {
          dom.find(' textarea[name=\'' + field.name + '\']', this.container).innerText = cm.getDoc().getValue();
        });
      }
    } else if (field.input == 'avatar') {
      new Avatar({
        readonly: this.readonly,
        name: field.name
      }).render(dom.find('div[data-avatar-name=\'' + field.name + '\']', this.container), field.value);
    } else if (field.input == 'logo') {
      new Logo({
        readonly: this.readonly,
        name: field.name
      }).render(dom.find('div[data-logo-name=\'' + field.name + '\']', this.container), field.value);
    }
  }

  let containerButtons = dom.create('div');
  containerButtons.classList.add('buttons');
  let buttons = dom.create('div', 'float-right');

  let buttonSave = dom.create('button', 'btn', 'btn-sm', 'btn-save');
  buttonSave.textContent = '保存';
  dom.bind(buttonSave, 'click', function(event) {
    event.preventDefault();
    event.stopPropagation();
    self.save();
  });
  if (!this.readonly) {
    buttons.appendChild(buttonSave);
    buttons.append(' ');
  }

  // custom buttons
  for (let i = 0; i < this.actions.length; i++) {
    buttons.appendChild(this.createButton(this.actions[i]));
    buttons.append(' ');
  }

  let buttonClose = dom.create('button', 'btn', 'btn-sm', 'btn-close');
  buttonClose.textContent = '关闭';
  dom.bind(buttonClose, 'click', function() {
    event.preventDefault();
    event.stopPropagation();
    let rightbar = dom.ancestor(self.container, 'div', 'right-bar');
    if (rightbar != null) {
      rightbar.classList.add('out');
      setTimeout(function () {
        rightbar.remove();
      }, 1000);
    }
  });
  buttons.appendChild(buttonClose);
  // if (this.actions.length > 0) {
  let row = dom.create('div', 'full-width', 'card', 'card-body', 'b-a-0');
  // row.style.backgroundColor = '#f0f3f5';
  row.style.paddingTop = '5px';
  row.style.paddingBottom = '5px';
  row.style.borderTop = '1px solid #c8ced3';
  row.style.borderBottom = '1px solid #c8ced3';
  row.style.paddingRight = '15px';
  row.style.marginLeft = '-10px';
  row.style.position = 'fixed';
  row.style.zIndex = '2001';
  let rightbar = dom.find('.right-bar');
  if (rightbar != null) {
    //
    // kui.css
    // right-bar
    // top: -28px
    //
    // 只有在rightbar下，才允许
    rightbar.style.height = (window.innerHeight + 28) + 'px';
    form.style.marginBottom = '4rem';
    row.style.top = (rightbar.clientHeight - buttons.clientHeight - 28 - 13) + 'px';

    containerButtons.appendChild(buttons);
    row.appendChild(containerButtons);
    this.container.appendChild(row);
  }

  this.originalPosition = this.container.getBoundingClientRect();
  this.originalPositionTop = this.originalPosition.top;
};

/**
 * Fetches form data from remote data source and renders form
 * under container.
 *
 * @param read
 *        the remote options
 */
FormLayout.prototype.fetch = function (params) {
  let self = this;
  params = params || {};
  if (!this.readOpt) {
    this.build(params);
    return;
  }
  if (this.readOpt.params) {
    for (let k in this.readOpt.params) {
      params[k] = this.readOpt.params[k];
    }
  }
  // if not need to fetch data
  if (!this.readOpt.url && this.readOpt.url == '') {
    this.build({});
    return;
  }
  xhr.post({
    url: this.readOpt.url,
    data: params,
    success: function(resp) {
      if (resp.error) {
        dialog.error(resp.error.message);
        return;
      }
      let data = resp.data;
      if (self.readOpt.convert) {
        data = self.readOpt.convert(data);
      }
      if (utils.isEmpty(data)) {
        self.build(params);
      } else {
        for (let keyParam in params) {
          if (typeof data[keyParam] === 'undefined') {
            data[keyParam] = params[keyParam];
          }
        }
        self.build(data);
      }
    }
  });
  this.params = params;
};

FormLayout.prototype.read = function (params) {
  let self = this;
  params = params || {};

  if (this.readOpt.params) {
    for (let k in this.readOpt.params) {
      params[k] = this.readOpt.params[k];
    }
  }
  xhr.post({
    url: this.readOpt.url,
    data: params,
    success: function(resp) {
      if (resp.error) {
        dialog.error(resp.error.message);
        return;
      }
      dom.formdata(self.container, resp.data);
    }
  });
};

/**
 * Saves form data to remote data source.
 */
FormLayout.prototype.save = function () {
  let self = this;
  let errors = Validation.validate($(this.containerId));
  if (errors.length > 0) {
    self.error(utils.message(errors));
    return;
  }
  // disable all buttons
  let buttonSave = dom.find('button.btn-save', this.container);
  if (buttonSave != null)
    buttonSave.innerHTML = "<i class='fa fa-spinner fa-spin'></i>数据保存中……";
  dom.disable(dom.find('button', this.container), 'disabled', true);
  let formdata = dom.formdata(this.containerId);
  let data = this.saveOpt.params || {};
  for (let key in formdata) {
    data[key] = formdata[key];
  }
  if (this.saveOpt.convert) {
    data = this.saveOpt.convert(data);
  }
  xhr.post({
    url: this.saveOpt.url,
    usecase: this.saveOpt.usecase,
    data: data,
    success: function(resp) {
      // enable all buttons
      if (buttonSave != null)
        buttonSave.innerHTML = '保存';
      dom.enable( 'button', self.container);
      if (resp.error) {
        self.error(resp.error.message);
        return;
      }
      let identifiables = document.querySelectorAll( ' input[data-identifiable=true]', self.container);
      for (let i = 0; i < identifiables.length; i++) {
        identifiables[i].value = resp.data[identifiables[i].name];
      }
      if (self.saveOpt.callback) self.saveOpt.callback(resp.data);
      self.success("数据保存成功！");
    }
  });
};

/**
 * Creates input element in form.
 *
 * @param field
 *        field option
 *
 * @param columnCount
 *        column count in a row
 *
 * @returns {object} label and input with add-ons dom elements
 *
 * @private
 */
FormLayout.prototype.createInput = function (field, columnCount) {
  let self = this;
  columnCount = columnCount || 2;
  let label = dom.create('div', columnCount == 2 ? 'col-md-2' : 'col-md-3', 'col-form-label');
  label.innerText = field.title + '：';
  let group = dom.create('div', columnCount == 2 ? 'col-md-4' : 'col-md-9', 'input-group');

  let input = null;
  if (field.input == 'code') {
    let fixed = field.fixed || [];
    for (let i = 0; i < fixed.length; i++) {
      let prepend = dom.element(`
        <div class="input-group-prepend">
          <span class="input-group-text">
          </span>
        </div>
      `);
      prepend.querySelector('span').innerText = fixed[i];
      group.appendChild(prepend);
    }
    input = dom.create('input', 'form-control');
    input.disabled = this.readonly || field.readonly || false;
    input.setAttribute('name', field.name);
  } else if (field.input == 'select') {
    input = dom.create('select', 'form-control');
    input.style = '-moz-appearance:none';
    input.disabled = this.readonly || field.readonly || false;
    input.setAttribute('name', field.name);
  } else if (field.input == 'bool') {
    input = dom.element(`
      <label class="c-switch c-switch-label c-switch-pill c-switch-info mt-1">
        <input class="c-switch-input" value="T" name="" type="checkbox">
        <span class="c-switch-slider" data-checked="是" data-unchecked="否"></span>
      </label>
    `);
    if (field.value == true || field.value == 'true' || field.value == 'T') {
      dom.find('input', input).checked = true;
    }
    dom.find('input', input).setAttribute('name', field.name);
  } else if (field.input == 'radio') {
    for (let i = 0; i < field.values.length; i++) {
      let val = field.values[i];
      let radio = dom.element(`
        <div class="form-check form-check-inline">
          <input id="" name="" value="" type="radio"
                 class="form-check-input radio color-primary is-outline">
          <label class="form-check-label" for=""></label>
        </div>
      `);
      dom.find('input', radio).id = 'radio_' + val.value;
      dom.find('input', radio).name = field.name;
      if (field.value == val.value) {
        dom.find('input', radio).checked = true;
      }
      dom.find('input', radio).value = val.value;
      dom.find('input', radio).disabled = this.readonly || field.readonly || false;
      dom.find('label', radio).setAttribute('for', 'radio_' + val.value);
      dom.find('label', radio).textContent = val.text;
      group.append(radio);
    }
  } else if (field.input == 'longtext') {
    input = dom.create('textarea', 'form-control');
    field.style = field.style || '';
    input.style = field.style;
    // if (this.readonly)
    //   input.style.backgroundColor = 'rgb(240, 243, 245)';
    if (field.style === '')
      input.rows = 4;
    input.setAttribute('name', field.name);
    input.innerHTML = field.value || '';
    if (this.readonly)
      input.setAttribute('disabled', true);
  } else if (field.input == 'cascade') {
    input = dom.create('div', 'form-control');
    if (this.readonly)
      input.style.backgroundColor = 'rgb(240, 243, 245)';
    input.setAttribute('data-cascade-name', field.name);
  } else if (field.input == 'checktree') {
    input = dom.create('div', 'full-width');
    input.setAttribute('data-checktree-name', field.name);
    input.setAttribute('id', 'checktree_' + field.name);
  } else if (field.input == 'checklist') {
    input = dom.create('div', 'full-width');
    input.setAttribute('data-checklist-name', field.name);
  } else if (field.input == 'fileupload') {
    input = dom.create('div', 'full-width');
    input.setAttribute('data-fileupload-name', field.name);
  } else if (field.input == 'avatar') {
    input = dom.create('div', 'full-width');
    input.setAttribute('data-avatar-name', field.name);
    group.classList.remove('col-md-4', 'col-md-9');
    group.classList.add('col-md-12');
    group.appendChild(input);
    return {label: null, input: group};
  } else if (field.input == 'logo') {
    input = dom.create('div', 'full-width');
    input.setAttribute('data-logo-name', field.name);
    group.classList.remove('col-md-4', 'col-md-9');
    group.classList.add('col-md-12');
    group.appendChild(input);
    return {label: null, input: group};
  } else if (field.input == 'datetime') {
    let dateIcon = dom.element(`
      <div class="input-group-prepend">
        <span class="input-group-text">
          <i class="far fa-calendar-alt"></i>
        </span>
      </div>
    `);
    let dateInput = dom.create('input', 'form-control');
    dateInput.disabled = this.readonly || field.readonly || false;
    dateInput.setAttribute('name', field.name + '_date');

    let timeIcon = dom.element(`
      <div class="input-group-prepend">
        <span class="input-group-text">
          <i class="far fa-clock"></i>
        </span>
      </div>
    `);
    let timeInput = dom.create('input', 'form-control');
    timeInput.disabled = this.readonly || field.readonly || false;
    timeInput.setAttribute('name', field.name + '_time');

    group.appendChild(dateIcon);
    group.appendChild(dateInput);
    group.appendChild(timeIcon);
    group.appendChild(timeInput);
    return {label: label, input: group};
  } else {
    input = dom.create('input', 'form-control');
    input.disabled = this.readonly || field.readonly || false;
    input.setAttribute('name', field.name);
  }
  if (input != null) {
    group.appendChild(input);
  }

  if (field.domain) {
    input.setAttribute('data-domain-type', field.domain);
  } else if (field.input == 'date') {
    input.setAttribute('data-domain-type', 'date');
  } else if (field.input.indexOf('number') == 0) {
    input.setAttribute('data-domain-type', field.input);
  } else if (field.input == 'file') {
    input.setAttribute('readonly', true);
    let fileinput = dom.create('input');
    fileinput.setAttribute('type', 'file');
    fileinput.style.display = 'none';
    let upload = dom.element('<span class="input-group-text pointer"><i class="fas fa-upload text-primary"></i></span>');
    upload.addEventListener('click', function() {
      fileinput.click();
    });
    fileinput.addEventListener('change', function(event) {
      event.preventDefault();
      event.stopPropagation();
      input.value = fileinput.files[0].name;
      FormLayout.validate(input);
    });
    group.appendChild(fileinput);
    if (!this.readonly) {
      group.appendChild(upload);
    }
  }

  if (field.create) {
    let addnew = dom.element(`
      <div class="input-group-append">
        <span class="input-group-text">
          <i class="fas fa-plus-square pointer text-success"></i>
        </span>
      </div>
    `);
    group.appendChild(addnew);
  }

  let unit = dom.element(`
    <div class="input-group-append">
      <span class="input-group-text"></span>
    </div>
  `);
  if (field.unit) {
    dom.find('span', unit).innerHTML = field.unit;
    group.appendChild(unit);
  }

  let tooltip = dom.element(`
    <div class="input-group-append">
      <span class="input-group-text width-36 icon-error"></span>
    </div>
  `);
  if (field.required && input != null /* radio, check cause input is null*/) {
    input.setAttribute('data-required', field.title);
    dom.find('span', tooltip).innerHTML = ICON_REQUIRED;
  } else {
    dom.find('span', tooltip).innerHTML = ICON_GENERAL;
  }
  if (field.tooltip) {
    tooltip.classList.add('pointer');
    let popup = dom.element(
      '<div class="popup hidden">' +
      '  <div class="popup-arrow"></div>' +
      '  <div class="popup-body">' + field.tooltip + '</div>' +
      '</div>');
    tooltip.appendChild(popup);
    dom.bind(tooltip, 'click', function() {
      let ox = this.offsetLeft;
      let oy = this.offsetTop;
      let height = parseInt(this.clientHeight);
      let popup = dom.find('div.popup', this);

      popup.style.right = '0';
      popup.style.top = oy - (height / 2) + 'px';

      popup.classList.remove('hidden');
      popup.classList.add('show');

      setTimeout(function(event) {
        popup.classList.remove('show');
        popup.classList.add('hidden');
      }, 2000);
    });
  }
  if (!this.readonly &&
    field.input !== 'bool' &&
    field.input !== 'radio' &&
    field.input !== 'checklist' &&
    field.input !== 'longtext' &&
    field.input !== 'checktree' &&
    field.input !== 'fileupload')
    group.append(tooltip);

  // user input
  if (input != null) {
    dom.bind(input, 'input', function (event) {
      FormLayout.validate(this);
    });
  }

  // set value programmatically
  if (field.input == 'date' || field.input == 'text' || field.input.indexOf('number') == 0 || field.input == 'file') {
    const {get, set} = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    Object.defineProperty(input, 'value', {
      get() {
        return get.call(this);
      },
      set(newVal) {
        set.call(this, newVal);
        FormLayout.validate(this);
        return newVal;
      }
    });
    input.value = field.value;
  }
  if (field.input == 'select') {
    const {get, set} = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'selectedIndex');
    Object.defineProperty(input, 'selectedIndex', {
      get() {
        return get.call(this);
      },
      set(newVal) {
        set.call(this, newVal);
        FormLayout.validate(this);
        return newVal;
      }
    });
    input.value = field.value;
  }

  if (field.input.indexOf('number') == 0) {
    ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function (event) {
      input.addEventListener(event, function (event) {
        let domainType = this.getAttribute('data-domain-type');
        let validation = Validation.getDomainValidator(new ValidationModel(domainType));
        // /^-?\d*$/.test(this.value)
        if (validation.test(this.value) != REQUIRED_ERROR) {
          this.oldValue = this.value;
          this.oldSelectionStart = this.selectionStart;
          this.oldSelectionEnd = this.selectionEnd;
        } else if (this.hasOwnProperty("oldValue")) {
          this.value = this.oldValue;
          this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
        } else {
          this.value = "";
        }
        FormLayout.validate(this);
      });
    });
  }

  return {label: label, input: group};
};

/**
 * Creates button element.
 *
 * @param action
 *        action option
 *
 * @returns {button} the button dom element
 *
 * @private
 */
FormLayout.prototype.createButton = function(action) {
  let button = dom.create('button', 'btn', 'btn-sm');
  if (action.classes) {
    for (let i = 0; i < action.classes.length; i++) {
      button.classList.add(action.classes[i]);
    }
  }
  button.innerHTML = action.text;
  if (action.click) {
    button.addEventListener('click', action.click);
  }
  return button;
};

FormLayout.prototype.error = function (message) {
  message = message || '出现系统错误！';
  message = message.replaceAll('\n', '<br>');
  this.toast.style.zIndex = 11000;
  this.toast.classList.remove('bg-success', 'hidden');
  this.toast.classList.add('bg-danger');
  dom.find('.toast-body', this.toast).innerHTML = message;
  dom.find('strong', this.toast).innerText = '错误';
  this.toast.classList.add('show', 'in');
};

FormLayout.prototype.success = function (message) {
  let self = this;
  this.toast.style.zIndex = 11000;
  this.toast.classList.remove('bg-danger', 'hidden');
  this.toast.classList.add('bg-success');

  let posInScreen = this.container.getBoundingClientRect();
  let offsetTop = posInScreen.top - this.originalPositionTop;

  this.toast.style.top = (-offsetTop + 10) + 'px';
  dom.find('.toast-body', this.toast).innerHTML = message;
  dom.find('strong', this.toast).innerText = '成功';
  this.toast.classList.add('show', 'in');
  setTimeout(function() {
    dom.find('button', self.toast).click();
  }, 2000);
};

/**
 * Validates an input in a form.
 *
 * @param input
 *        the dom element for user input
 */
FormLayout.validate = function(input) {
  if (input.tagName == 'OPTION')
    input = input.parentElement;
  if (input == null) return;

  let span = dom.find('div span.icon-error', input.parentElement);
  if (span == null) return; // readonly
  let dataRequired = input.getAttribute('data-required');
  let required =  dataRequired != null && dataRequired !== '';
  if (input.tagName == 'SELECT') {
    if (input.selectedIndex == -1) {
      if (required)
        span.innerHTML = ICON_REQUIRED;
      else
        span.innerHTML = ICON_GENERAL;
    } else {
      span.innerHTML = ICON_CORRECT;
    }
    return;
  } else if (input.tagName == 'DIV') {
    // cascade
    let links = input.querySelectorAll('a[data-cascade-name]');
    let values = [];
    for (let i = 0; i < links.length; i++) {
      let link = links[i];
      let value = link.getAttribute('data-cascade-value');
      if (value != null && value != '-1' && value != '') {
        values.push(value);
      }
    }
    if (values.length == links.length) {
      span.innerHTML = ICON_CORRECT;
    } else if (values.length == 0) {
      if (required)
        span.innerHTML = ICON_REQUIRED;
      else
        span.innerHTML = ICON_GENERAL;
    } else {
      span.innerHTML = ICON_ERROR;
    }
    return;
  }

  if (input.value.trim() == '') {
    if (required)
      span.innerHTML = ICON_REQUIRED;
    else
      span.innerHTML = ICON_GENERAL;
    return;
  }

  let domainType = input.getAttribute('data-domain-type');
  if (domainType != null && domainType != '') {
    let validation = Validation.getDomainValidator(new ValidationModel(domainType));
    let res = validation.test(input.value);
    if (res == NO_ERRORS) {
      span.innerHTML = ICON_CORRECT;
    } else if (res == FORMAT_ERROR) {
      span.innerHTML = ICON_ERROR;
    }
  } else {
    span.innerHTML = ICON_CORRECT;
  }
};

FormLayout.prototype.input = function(nameAndValue) {
  let name = nameAndValue.name;
  let value = nameAndValue.value;
  let text = nameAndValue.text;
  let control = this.controls[name];
  if (!control) return;
  let newOption = new Option(text, value, false, true);
  control.append(newOption).trigger('change');
};

FormLayout.skeleton = function() {
  return dom.element(`
    <div style="border: 1px solid rgba(0, 0, 0, 0.3); border-radius: 4px; width: 100%;">
      <div
          style="align-items: center; border-bottom: 1px solid rgba(0, 0, 0, 0.3); display: flex; justify-content: space-between; padding: 16px;">
        <div style="width: 60%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 2px; height: 8px; width: 100%;"></div>
        </div>
        <div style="color: rgba(0, 0, 0, 0.7);">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 16px; width: 16px;"></div>
        </div>
      </div>
      <div style="padding: 16px;">
        <div style="margin-bottom: 16px;">
          <div style="display: flex; flex-wrap: wrap; justify-content: start; width: 100%;">
            <div style="margin-bottom: 8px; margin-right: 8px; width: 50%;">
              <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
            </div>
            <div style="margin-bottom: 8px; margin-right: 8px; width: 50%;">
              <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
            </div>
            <div style="margin-bottom: 8px; margin-right: 8px; width: 20%;">
              <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
            </div>
            <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
              <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
            </div>
            <div style="margin-bottom: 8px; margin-right: 8px; width: 20%;">
              <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
            </div>
            <div style="margin-bottom: 8px; margin-right: 8px; width: 30%;">
              <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
            </div>
            <div style="margin-bottom: 8px; margin-right: 8px; width: 50%;">
              <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
            </div>
            <div style="margin-bottom: 8px; margin-right: 8px; width: 10%;">
              <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
            </div>
            <div style="margin-bottom: 8px; margin-right: 8px; width: 30%;">
              <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
            </div>
            <div style="margin-bottom: 8px; margin-right: 8px; width: 30%;">
              <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
            </div>
          </div>
        </div>
        <div style="display: flex; flex-wrap: wrap; justify-content: start; width: 100%;">
          <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
          </div>
          <div style="margin-bottom: 8px; margin-right: 8px; width: 20%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
          </div>
          <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
          </div>
          <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
          </div>
          <div style="margin-bottom: 8px; margin-right: 8px; width: 30%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
          </div>
        </div>
      </div>
      <div style="border-top: 1px solid rgba(0, 0, 0, 0.3); display: flex; justify-content: flex-end; padding: 16px;">
        <div style="margin-right: 8px; width: 30%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 2px; height: 32px; width: 100%;"></div>
        </div>
        <div style="width: 30%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 2px; height: 32px; width: 100%;"></div>
        </div>
      </div>
    </div>  
  `);
};