from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path('/home/ubuntu/craftacus/addons/craftein-core/resource_pack')
(ROOT / 'textures/item').mkdir(parents=True, exist_ok=True)
(ROOT / 'textures/particle').mkdir(parents=True, exist_ok=True)
(ROOT / 'textures/ui').mkdir(parents=True, exist_ok=True)
(ROOT / 'textures/gui/title').mkdir(parents=True, exist_ok=True)

# Original CRAFTEIN prototype sword icon: a compact astral blade, not copied from
# the Java reference pack. The 16-frame sheet is used by the resurrection aura.
def make_icon(path: Path):
    im = Image.new('RGBA', (128, 128), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.polygon([(64, 9), (70, 28), (84, 62), (69, 66), (64, 112), (58, 66), (44, 62), (58, 28)], fill=(111, 230, 255, 255), outline=(215, 250, 255, 255))
    d.polygon([(64, 18), (67, 31), (74, 59), (64, 62), (54, 59), (61, 31)], fill=(242, 255, 255, 255))
    d.rectangle((53, 62, 75, 68), fill=(67, 20, 108, 255))
    d.polygon([(54, 68), (74, 68), (82, 77), (46, 77)], fill=(255, 194, 70, 255))
    d.rectangle((61, 76, 67, 108), fill=(102, 52, 169, 255))
    d.ellipse((57, 105, 71, 118), fill=(42, 15, 74, 255), outline=(193, 118, 255, 255))
    im.save(path)

# 16-frame horizontal sheet for particles: halo, ring, spark, core.
def make_sheet(path: Path):
    w = h = 64
    sheet = Image.new('RGBA', (w * 16, h), (0, 0, 0, 0))
    for i in range(16):
        frame = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        d = ImageDraw.Draw(frame)
        cx = cy = 32
        radius = 5 + int(18 * (i + 1) / 16)
        alpha = max(20, 230 - i * 12)
        d.ellipse((cx-radius, cy-radius, cx+radius, cy+radius), outline=(161, 90, 255, alpha), width=3)
        d.ellipse((cx-5, cy-5, cx+5, cy+5), fill=(210, 246, 255, max(30, 220 - i * 8)))
        frame = frame.filter(ImageFilter.GaussianBlur(1.2))
        sheet.paste(frame, (i * w, 0), frame)
    sheet.save(path)

def make_life_hearts():
    # Compact 18x18 custom life icons using the hardcore visual language:
    # dark crimson core, pale highlight, and a sharp pixel silhouette.
    for name, fill in [('heart_hardcore_full', (150, 20, 35, 255)), ('heart_hardcore_empty', (53, 12, 20, 255)), ('heart_hardcore_half', (106, 16, 28, 255))]:
        im = Image.new('RGBA', (18, 18), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        outline = (28, 5, 12, 255)
        pixels = [(3, 4), (4, 3), (5, 3), (6, 4), (7, 5), (8, 4), (9, 3), (10, 3), (11, 4), (12, 5), (13, 6), (12, 9), (11, 11), (10, 13), (9, 15), (8, 16), (7, 15), (6, 13), (5, 11), (4, 9), (3, 7)]
        for x, y in pixels: d.rectangle((x, y, x + 1, y + 1), fill=outline)
        inner = [(4, 5), (5, 4), (6, 5), (7, 6), (8, 7), (9, 6), (10, 4), (11, 5), (12, 6), (11, 9), (10, 11), (9, 13), (8, 14), (7, 12), (6, 10), (5, 8), (4, 6)]
        for x, y in inner:
            if name.endswith('half') and x > 7: continue
            d.point((x, y), fill=fill)
        d.point((5, 5), fill=(255, 120, 130, 255))
        im.save(ROOT / 'textures/ui' / f'{name}.png')

def make_branding():
    source = Path('/home/ubuntu/upload/minecraft_title2.png')
    if not source.exists(): return
    logo = Image.open(source).convert('RGBA')
    logo.save(ROOT / 'textures/gui/title/minecraft.png')
    canvas = Image.new('RGBA', (512, 512), (24, 2, 28, 255))
    fitted = logo.copy()
    fitted.thumbnail((480, 180), Image.Resampling.LANCZOS)
    canvas.alpha_composite(fitted, ((512 - fitted.width) // 2, (512 - fitted.height) // 2))
    canvas.save(ROOT.parent / 'pack_icon.png')
    canvas.save(ROOT.parent / 'behavior_pack' / 'pack_icon.png')
    canvas.save(ROOT / 'pack_icon.png')

make_icon(ROOT / 'textures/item/astral_blade.png')
make_sheet(ROOT / 'textures/particle/craftein_ritual_sheet.png')
make_life_hearts()
make_branding()
