# Node Watermarker
Watermark module from my Telegram bot. Rewritten in TS and removed video watermark (currently only image supported)

---

<details>
  <summary>Usage</summary>

## Module

### Promise
```js
const watermarker = require("./dist/watermark");

const result = await watermarker({
  input: "input.jpg",
  watermark: "watermark.png",
});
```  

### Callback
```js
const watermarker = require("./dist/watermark");

watermarker({
  input: "input.jpg",
  watermark: "watermark.png",
  callback: result => {}
});
```

## Fork

```js
const cp = require("node:child_process");

const instance = cp.fork("./dist/watermark");

instance.send({
  input: "input.jpg",
  watermark: "watermark.png",
});

instance.on('message', result => {});
```

</details>

<details>
  <summary>Config</summary>

Key | Value
------------ | -------------
*`input` | Path to input file
`output` | Path to save output at (default: overwrite input)
*`watermark` | Path to watermark image
`position` | Position of watermark / 3x3 matrix / 1-3 (default: center)
`margin` | Margin (percent) of watermark (default 5%)
`size` | Watermark size (percent of smaller side)
`opacity` | Watermark opacity (percent)
`blender` | Watermark blend type
`callback` | Task callback

_\*Required_

### Sample
```js
const config = {
  input: "input.jpg", output: "output.jpg",
  watermark: "logo.png",
  position: { x: 3, y: 3 },
  margin: { x: 5, y: 1 },
  size: 40,
  opacity: 100,
  blender: "overlay",
  callback: result => {
    console.log(result.status ?? result.error)
  }
};
```

</details>

<details>
  <summary>Result</summary>
  
```js
const result = { /* Error */
  error: "error message",
};

const result = { /* Has output */
  status: "ok" /* or */ "nochange",
  output: "pathToOutputFile"
};
```
  
</details>
