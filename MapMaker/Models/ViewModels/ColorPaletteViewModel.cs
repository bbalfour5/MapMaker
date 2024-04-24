namespace MapMaker.Models.ViewModels
{
    public class ColorPaletteViewModel
    {
        private string _canvasColor = "#ffffff";
        private string _landColor = "#4a6741";
        private string _textColor = "#000000";

        public ColorPaletteViewModel()
        {
            CanvasColor = _canvasColor; 
            LandColor = _landColor;
            TextColor = _textColor;
        }

        public ColorPaletteViewModel(string canvasColor, string landColor, string textColor)
        {
            CanvasColor = canvasColor;
            LandColor = landColor;
            TextColor = textColor;
        }

        public string CanvasColor { get; set; }
        public string LandColor { get; set; }
        public string TextColor { get; set; }
    }
}
