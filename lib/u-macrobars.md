# macrobars.js

A lightweight JavaScript templating engine with PHP-style syntax and Handlebars-inspired features.

## Basic Usage

```javascript
const template = Macrobars.compile('<h1>{{title}}</h1><p>{{content}}</p>');
const html = template({title: 'Hello', content: 'World'});
```

## Field Output

```javascript
{{field}}                    // Safe HTML output (escaped)
{{{field}}}                  // Unsafe HTML output (raw)
{{field or "default"}}       // With default value
{{:variable}}                // Direct variable (no data. prefix)
```

## Numbers

```javascript
{{%number}}                  // Formatted number (2 decimals)
{{~number}}                  // Rounded number (1k, 1M format)
```

## Control Structures

### Conditionals
```javascript
{{#if condition}}
    Content when true
{{#else}}
    Content when false
{{/if}}
```

### Equality Blocks
```javascript
{{#eq value1 value2}}
    Content when equal
{{/eq}}

{{eq value1 value2}}         // Inline: outputs "true" or ""
```

### Loops
```javascript
{{#each items}}
    {{name}} - {{index}}
{{/each}}

{{#each items as item}}
    {{item.name}}
{{/each}}
```

### Property Lookup
```javascript
{{#lookup object key}}
    {{value}} exists
{{/lookup}}

{{lookup object key}}        // Inline: outputs value or ""
```

## Code Blocks

```javascript
<script>
    var result = data.value * 2;
</script>

<defer>
    // Deferred JavaScript execution
</defer>

<?= data.field ?>            // PHP-style output
<? var x = data.count; ?>    // PHP-style code
```

## Event Binding

```javascript
<button {{@click="handleClick"}}>Click me</button>
```

Events are automatically bound when using `renderTo()`.

## Components

```javascript
{{#component myComponent}}   // Render registered component
```

## Compilation Options

```javascript
const template = Macrobars.compile(templateString, {
    decimals: 2,             // Number formatting precision
    strict: true,            // Use strict mode
    components: {...}        // Reusable components
});
```

## DOM Integration

```javascript
template.renderTo('#container', data);          // Render to element
template.renderTo(document.getElementById('x'), data);
```

## Utility Functions

```javascript
Macrobars.safe_out(text, default)      // HTML escape
Macrobars.num_out(number, decimals)    // Format number
Macrobars.num_out_round(number)        // Round with k/M suffix
```

## Template Debugging

Access compiled template information:
```javascript
template.tokens             // Parsed tokens
template.gensource          // Generated JavaScript
template.event_bindings     // Event binding data
```

## Default Values

```javascript
{{#default "N/A"}}          // Set default for empty fields
{{field}}                   // Will show "N/A" if empty
```

