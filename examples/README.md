# Examples

The json file structure for tools is a list containing multiple objects of the following format:

```js
{
        "key": String, // key used to refer to the tool
        "name": String, // display name
        "type": String, // one of: "other", "artisan", "gaming", "instrument", "vehicle"
        "description": String, // html string of description which will appear in tool summary in the tool tab
    }
```