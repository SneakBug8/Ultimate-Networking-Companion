const colors = ["red", "blue", "green", "yellow", "darkmagenta", "cyan", "darkgreen",
  "orange", "pink"];

const alphacolors = ["rgba(255, 0, 0, 0.5)", "rgba(0,0,255,0.5)", "rgba(0,255,0,0.5)",
  "yellow", "darkmagenta", "cyan", "darkgreen",
"orange", "pink"];

const backgrounds = ["rgba(255, 0, 0, 0.5)", "rgba(0,0,255,0.5)", "rgba(0,255,0,0.5)",  "lightyellow", "mediumorchid",
  "rgba(0,255,255,0.5f)", "mediumseagreen",
  "sandybrown", "lightpink"];

export class Color
{
  public static GetColor(index: number)
  {
    return colors[index % colors.length];
  }

  public static GetAlphaColor(index: number)
  {
    return alphacolors[index % colors.length];
  }

  public static GetBackground(index: number)
  {
    return backgrounds[index % backgrounds.length];
  }
}