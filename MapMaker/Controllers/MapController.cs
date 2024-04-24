using MapMaker.Models.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace MapMaker.Controllers
{
    public class MapController : Controller
    {
        public IActionResult Index(string canvasColor, string landColor, string textColor)
        {
            MapIndexViewModel mapIdxVM;
            if (!string.IsNullOrEmpty(canvasColor) && !string.IsNullOrEmpty(landColor) && !string.IsNullOrEmpty(textColor))
                mapIdxVM = new MapIndexViewModel
                {
                    ColorPalette = new ColorPaletteViewModel(canvasColor, landColor, textColor)
                };
            else
            {
                mapIdxVM = new MapIndexViewModel();
            }

            return View(mapIdxVM);
        }
    }
}
