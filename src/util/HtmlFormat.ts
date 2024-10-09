const replaces = [
  ["&#8211;", "–"],
  ["&#8212;", "—"],
  ["&#8216;", "'"],
  ["&#8217;", "'"],
  ["&quot;", '"'],
  ["&amp;", "&"],
  ["", "# *(.+)\n"],
  ["<br>", "\n"],
];

const toHtmlReplaces = [
  ["# *(.+)\n", ""],
];

class HtmlFormatClass
{
  public FromHtml(text: string)
  {
    let cleantext = text.replace(/<\/?[^>]+(>|$)/g, "");

    for (const r of replaces) {
      cleantext = cleantext.replace(new RegExp(r[0], "g"), r[1]);
    }

    return cleantext;
  }
  public ToHtml(text: string)
  {
    let cleantext = text;

    for (const r of toHtmlReplaces) {
      cleantext = cleantext.replace(new RegExp(r[1], "g"), r[0]);
    }

    for (const r of replaces) {
      cleantext = cleantext.replace(new RegExp(r[1], "g"), r[0]);
    }

    return cleantext;
  }
}

export const HtmlFormat = new HtmlFormatClass();
