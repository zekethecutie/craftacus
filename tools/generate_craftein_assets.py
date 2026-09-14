from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path('/home/ubuntu/craftacus/addons/craftein-core/resource_pack')
(ROOT / 'textures/item').mkdir(parents=True, exist_ok=True)
(ROOT / 'textures/particle').mkdir(parents=True, exist_ok=True)

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

make_icon(ROOT / 'textures/item/astral_blade.png')
make_sheet(ROOT / 'textures/particle/craftein_ritual_sheet.png')
