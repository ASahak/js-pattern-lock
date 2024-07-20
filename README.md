# JS Pattern Lock

A JavaScript library for implementing Android-style pattern lock screens in web applications.


## Installation
``
npm i js-pattern-lock
``

## Usage

### In your project you have to import the Instance ad the styles
```
import Grid from 'js-pattern-lock';
import 'js-pattern-lock/styles.css';

const grid = new Grid({
    mountRoot: hostNode, // this is mandatory to be able to host the grid instance
    patternLength: 6,
    matrix: { x: 4, y: 4 },
    css: {
        boxSize: 4,
        gap: 1.5,
        vertex: {
            colorSchema: 'green',
            size: 'md',
        }
    }
})
grid.init();

// You can also use reset the state by calling grid.resetState() and getting the current coords: grid.coords;

// If you want you can also listen the pattern snapshots as well

function subscribeChanges(coords, wrongPattern) {
    if (wrongPattern) {
      alert('Wrong pattern length');
      return;
    }
    
   console.log(coords);
  }

  grid.subscribe(subscribeChanges);
```
# API
### Props of Instance
| Props         | type                     | required | defaultValue |
|---------------|--------------------------|----------|--------------|
| mountRoot     | HTMLElement              | true     |              |
| patternLength | number                   | false    | x * y        |
| matrix        | { x: number, y: number } | true     |              |
| css           | CSSProps                 | true     |              |
<br />

### css props consist of these:
| Props   | type        | required | defaultValue |
|---------|-------------|----------|--------------|
| boxSize | number      | false    | 3            |
| gap     | number      | false    | 2            |
| vertex  | VertexProps | true     |              |
<br />

### vertex prop consist of these:
| Props       | type                   | required | defaultValue |
|-------------|------------------------|----------|--------------|
| size        | 'sm', 'md', 'lg'       | true     |              |
| colorSchema | 'green', 'red', 'gray' | true     |              |
<br />

If you encounter any issues, please visit this [link](https://github.com/ASahak/js-pattern-lock/issues).

If you loved this lib, you can show your support by

[<img src="https://skeleton-generator.vercel.app/buy-me-a-coffee.png" />](https://buymeacoffee.com/asahak)


### You can reach out to me via:
- **[Telegram](https://t.me/A_Sahak)**
- **[Linkedin](https://www.linkedin.com/in/arthur-sahakyan-276abb158/)**

### And thanks for using my library :)