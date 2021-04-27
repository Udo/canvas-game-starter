# Macrobars JavaScript Templating Library

### Why this exists

A couple of years ago, I made <a href="https://github.com/Udo/minibars">Minibars</a>,
a (sort-of) drop-in replacement for the Handlebars JavaScript templating library and
its relatives, mostly because they have a huge code size and I don't need all their
features.

Since then my thinking on templating has come full circle, mostly because I got tired
of all the glue code that tends to accumulate *outside* of templates, especially if
they don't fit neatly within the "this template renders a struct as-is" paradigm.
Macrobars is a return to full code execution in templates. Obviously, that makes it
unsuitable for some applications, but to be honest it's questionable whether Handlebars-like
templating was ever suitable in these contexts either.

The weird thing is, for all the additional power it has Macrobars' code size is even smaller
than that of Minibars.

# Getting Started

### 1. Define Templates

Macrobars templates are strings. For convenience, they can be defined and embedded in `<script>` tags:

```html
<script id="entry-template" type="text/x-macrobars">
  <div>
    <h1>{{title}}</h1>
    <div>
      {{body}}
    </div>
  </div>
</script>
```

### 2. Compile Templates

Before you can use the template, it needs to be compiled. For example, using jQuery to fetch the content of the template string, it might look like this:

```javascript
const myTemplate = Macrobars.compile(
    $('#entry-template').html());
```

The generic syntax for Macrobars compile is:
```javascript
	Macrobars.compile(template_text, options = {})
```

### 3. Execute Templates

Due to compilation, the template `myTemplate` becomes a simple function you can call, passing an arbitrary data object as an argument.

```javascript
$('#entries').append(myTemplate({
    title : 'Hello World!',
    body : '<Greetings from Macrobars!>',
    }));
```

When called, the Macrobars template function generates HTML code from that data:

```html
  <div>
    <h1>Hello World</h1>
    <div>
      &lt;Greetings from Minibars!&gt;
    </div>
  </div>
```

# Data Fields

Fundamentally, Macrobars fills fields from your data object into placeholders assigned for them inside the template. The example above illustrates a simple case. By default, all content is escaped for HTML code, meaning that the data will be seen as plain text by the browser.

Data fields start with two open curly braces and end with two closed curly braces: `{{object.field_name}}`.

###Summary

- use `{{` and `}}` to output a field
- use `<?=` and `?>` to output a field
- use `{{:` and `}}` to output any variable
- use `<?:` and `?>` to output any variable
- use `{{%` and `}}` to output formatted numbers with two decimals
- use `{{~` and `}}` to output rounded numbers
- use `{{{` and `}}}` for unsafe output

## Safe HTML Escaping

This is the default output mode. In the example above, the field `{{body}}`, combined with the data string `'<Greetings from Macrobars!>'` results in the output:

```
  &lt;Greetings from Macrobars!&gt;
```
If you want to override how this type of fields gets outputted, define a function called `safe_out(s)` in your template.

## Unescaped Output

If you want to stream unescaped HTML into your template, use three curly braces instead of two: `{{{some_html_data}}}`.

## Numeric Values

To interpret a field as a numeric value and output a formatted number, prepend your field name with a % character: `{{%my_number}}`. You can
optionally specify the number of decimal digits as well. This example will output a number with 3 decimal digits: `{{%my_number, 3}}`.

If you want to override how this type of fields gets outputted, define a function called `num_out(n)` in your template.

## Custom Function Calls

You can call your own functions inside fields. For example, the following will output a rounded number: `{{Math.round(field_name)}}`.
Likewise, you can pass parameters to built-in functions as illustrated in the numeric field example above.

## Accessing Sub Fields

Assuming you have a complex data object like this one:

```javascript
{
	title : 'Hello World',
	body : '<Greetings from Minibars!>',
	meta : {
		published : '2015-08-31',
		author : 'udo',
		email : 'udo.schroeter@gmail.com'
	}
}
```

In these cases, you can use the dot notation to access lower levels of the data inside your template:

```html
  <div>
    <h1>{{title}}</h1>
    <div>
      {{body}}
    </div>
    <div class="meta">
      published: {{meta.published}}
      by: <a href="mailto:{{meta.email}}">{{meta.author}}</a>
    </div>
  </div>
```
## each Block

To render a block for each item in an array, use the `{{#each listName}}` command:

```html
  <ul>
    {{#each items}}<div>
      {{@index}}: {{text}}
    </div>{{/each}}
  </ul>
```

where the data might look like this:

```javascript
{
  items : [
    { text : 'example 1' },
    { text : 'example 2' },
    { text : 'example 3' },
  ]
}
```

`each` blocks supply the local variable `:index`, containing the current numerical index of the entry.

## The default value

By default, a field referring to a non-existent variable will just output nothing. You can change this behavior
by defining a default field value that should be shown instead: `{{#default ALL EMPTY}}`. All non-existent fields
after this declaration will now show the string 'ALL EMPTY'.

## Field Scope

By default, all field commands internally use a variable called 'data' as their context. For example, a field like
`{{%my_number}}` would internally refer to `data.my_number`. Initially, this `data` object is whatever you pass
to the template function when you call it, it is the data you passed in. As the template runs, what `data` refers to
may change, for example within an 'each' loop: `{{#each some_array}}{{array_item}}{{/each}}` data will refer to the
current item. You may also change this yourself in code.

## Variables

```
Variable	Meaning
-------------------------------------------------------------------
data		current scope (changed inside 'each' to current item)
index		current index pointer
data_root	original data object passed into template function
options		the options you passed in when you compiled
this		the template function itself, which you can bind variables to
```

### Using variables

You can refer to *any* variable inside your template by prefixing your field
with a colon, like so:

```html
<script id="entry-template" type="text/x-macrobars">
  <div>
    <h1>{{title}}</h1>
    <div>
      {{:this.other_data}}
    </div>
  </div>
</script>
```

In the example above, the field `{{:this.other_data}}` would refer to a member variable 'other_data' bound to the
template function itself. Using this method, you can also refer to global variables, or variables your declared in
the template (see below).

# Executing Code Directly

Now comes the real meat of Macrobars: executing real JavaScript code directly within the template.

## Code Sections

Finally, you can execute any Javascript directly, just as you would in PHP.

To accomodate a range of editors and use cases, Macrobars executes any JavaScript code it finds in:
- between `<script>` and `</script>` tags
- between `<?` and `?>` processing instruction (PI) braces
- between commented PI braces `<!--?` and `?-->`

Within these code sections, you may execute any JavaScript code you like.

## Example

```html
<script>
  var faction = Game.get_faction(data.city.faction);
</script>

<div class="panel_title">
	<div class="closer" onclick="UI.close_panel('city');">x</div>
	{{city.name || 'unnamed city'}}
</div>

<div>
	<span class="param">Faction:</span> <span style="color:{{:faction.text_color}}">{{:faction.name}}</span><br/>
	<span class="param">Population:</span> {{~city.population*1000}}<br/>
	<span class="param">Productivity:</span> {{~city.productivity*100}}%<br/>
</div>

<div style="opacity:0.5"><script>

	each(data.city, (v, k) => {
		if(v > 0) v = num_out(v);
    </script>
      {{k+': '+v)}}
    <script>
	});

</script></div>
```

This example also illustrates flow control spanning across `<script>` and `</script>` tags.

## Deferred Execution

To NOT execute any Javascript immediately but instead output the code as-is
when the template executes, use the `<defer>` tag:

```html
<defer>
  var faction = Game.get_faction(data.city.faction);
</defer>
```

# Options

Compiler options you can pass in when compiling your template:

## strict

```javascript
	Macrobars.compile(template_text, options = { strict : true })
```

Will generate "use_strict"; pragma code (default is false).

## decimals

```javascript
	Macrobars.compile(template_text, options = { decimals : 3 })
```

Will change the number of decimals used with the `{{% field }}` instruction (default is 2).

# Debugging

```javascript
	var f = Macrobars.compile(template_text, options)
```

The code that was generated during compile is stored in `f.gensource`.

The tokens that were generated are stored in `f.tokens`.
