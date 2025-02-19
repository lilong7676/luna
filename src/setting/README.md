# Luna Setting

Settings panel.

## Demo

https://luna.liriliri.io/?path=/story/setting

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-setting/luna-setting.css" />
<script src="//cdn.jsdelivr.net/npm/luna-setting/luna-setting.js"></script>
```

You can also get it on npm.

```bash
npm install luna-setting --save
```

```javascript
import 'luna-setting/luna-setting.css'
import LunaSetting from 'luna-setting'
```

## Usage

```javascript
const setting = new LunaSetting(container)
const title = setting.appendTitle('Title')
setting.appendSeparator()
title.detach()
```

## Configuration

* filter(string | RegExp | AnyFn): Setting filter.
* separatorCollapse(boolean): Whether to collapse separator or not.

## Api

### appendButton(title: string, description: string, handler: AnyFn): SettingButton

Append button.

### appendCheckbox(key: string, value: boolean, title: string, description?: string): SettingCheckbox

Append checkbox setting.

### appendHtml(html: string | HTMLElement): SettingHtml

Append html setting.

### appendMarkdown(markdown: string): SettingMarkdown

Append markdown description.

### appendNumber(key: string, value: number, title: string, description: string, options: INumberOptions): SettingNumber

Append number setting.

### appendSelect(key: string, value: string, title: string, description: string, options: PlainObj<string>): SettingSelect

Append select setting.

### appendSeparator(): SettingSeparator

Append separator.

### appendText(key: string, value: string, title: string, description?: string): SettingText

Append text input setting.

### appendTitle(title: string, level?: number): SettingTitle

Append title.

### clear(): void

Clear all settings.

### remove(item: SettingItem): void

Remove setting.

## Types

### INumberOptions

* max(number): Max value.
* min(number): Min value.
* range(boolean): Use slider control or not.
* step(number): Interval between legal numbers.
