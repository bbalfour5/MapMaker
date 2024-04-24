namespace MapMaker.Models.ViewModels
{
    public class MapIndexViewModel
    {
        public MapIndexViewModel(){
            ColorPalette = new ColorPaletteViewModel();
        }
        public ColorPaletteViewModel ColorPalette { get; set; }
    }
}
