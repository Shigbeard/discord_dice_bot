<?php
class TTI
{
    private $img;
    function createImage($text, $size, $w, $h)
    {
        $font = './impact.ttf';
        $this->img = imagecreatetruecolor($w, $h);
        $green = imagecolorallocate($this->img, 0, 255, 0);
        $red = imagecolorallocate($this->img, 255, 0, 0);
        $white = imagecolorallocate($this->img, 255, 255, 255);
        $bg = imagecolorallocate($this->img, 32, 34, 37);
        $black = imagecolorallocate($this->img, 0, 0, 0);
        imagefilledrectangle($this->img, 0, 0, $w - 1, $h - 1, $bg);
        imagettftext($this->img, $size, 0, 0, $h, $white, $font, $text);

        $textBox = imagettfbbox($size, 0, $font, $text);
        $textWidth = abs(max($textBox[2], $textBox[4]));
        $textHeight = abs(max($textBox[5], $textBox[7]));
        $x = (imagesx($this->img) - $textWidth) / 2;
        $y = ((imagesy($this->img) + $textHeight) / 2) + 1 * $textHeight - ($size + $size / 8);

        //add some shadow to the text
        imagettftext($this->img, $size, 0, $x + 2, $y + 2, $black, $font, $text);
        imagettftext($this->img, $size, 0, $x + 2, $y - 2, $black, $font, $text);
        imagettftext($this->img, $size, 0, $x - 2, $y - 2, $black, $font, $text);
        imagettftext($this->img, $size, 0, $x - 2, $y + 2, $black, $font, $text);

        if ($_GET['crit']) {
            if ($_GET['crit'] == 'success') {
                imagettftext($this->img, $size, 0, $x, $y, $green, $font, $text);
            } elseif ($_GET['crit'] == 'failure') {
                imagettftext($this->img, $size, 0, $x, $y, $red, $font, $text);
            }
        } else {
            imagettftext($this->img, $size, 0, $x, $y, $white, $font, $text);
        }
        header ("Content-type: image/png");
        return imagepng($this->img);
    }
}

$img = new TTI;
$text = $_GET['number'];
$img->createImage($text, 30, 100, 100);
