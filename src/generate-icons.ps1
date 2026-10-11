Add-Type -AssemblyName System.Drawing

function Create-PwaIcon {
    param (
        [string]$Path,
        [int]$Size,
        [bool]$Maskable = $false
    )

    $bmp = New-Object System.Drawing.Bitmap $Size, $Size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # Background
    $bgColor = [System.Drawing.ColorTranslator]::FromHtml("#0B0F19")
    $bgBrush = New-Object System.Drawing.SolidBrush $bgColor
    $g.FillRectangle($bgBrush, 0, 0, $Size, $Size)

    # Scale factor
    $scale = $Size / 100.0
    $pad = if ($Maskable) { $Size * 0.1 } else { 0 }
    $innerSize = $Size - ($pad * 2)
    $innerScale = $innerSize / 100.0

    $cx = $Size / 2.0
    $cy = $Size / 2.0
    $r = 44 * $innerScale

    # Outer circle border
    $goldColor = [System.Drawing.ColorTranslator]::FromHtml("#EA580C")
    $goldPen = New-Object System.Drawing.Pen $goldColor, (6 * $innerScale)
    $g.DrawEllipse($goldPen, [float]($cx - $r), [float]($cy - $r), [float]($r * 2), [float]($r * 2))

    # Inner circular background
    $innerBgColor = [System.Drawing.ColorTranslator]::FromHtml("#111827")
    $innerBrush = New-Object System.Drawing.SolidBrush $innerBgColor
    $innerR = ($r - (3 * $innerScale))
    $g.FillEllipse($innerBrush, [float]($cx - $innerR), [float]($cy - $innerR), [float]($innerR * 2), [float]($innerR * 2))

    # Draw Text "KD" in bold modern styling
    $fontFamily = New-Object System.Drawing.FontFamily("Arial")
    $fontSize = 32 * $innerScale
    $font = New-Object System.Drawing.Font $fontFamily, $fontSize, ([System.Drawing.FontStyle]::Bold)
    $textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
    
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center

    $rect = New-Object System.Drawing.RectangleF 0, 0, $Size, ($Size * 0.88)
    $g.DrawString("KD", $font, $textBrush, $rect, $format)

    # Subtitle "SONDAJ"
    $subFont = New-Object System.Drawing.Font $fontFamily, (10 * $innerScale), ([System.Drawing.FontStyle]::Bold)
    $subBrush = New-Object System.Drawing.SolidBrush $goldColor
    $subRect = New-Object System.Drawing.RectangleF 0, ($Size * 0.62), $Size, ($Size * 0.25)
    $g.DrawString("SONDAJ", $subFont, $subBrush, $subRect, $format)

    $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Output "Created: $Path ($Size x $Size)"
}

$assetsDir = "d:\web_siteleri\kdsondaj\dist\assets"
Create-PwaIcon -Path "$assetsDir\icon-192.png" -Size 192 -Maskable $false
Create-PwaIcon -Path "$assetsDir\icon-512.png" -Size 512 -Maskable $false
Create-PwaIcon -Path "$assetsDir\icon-maskable-512.png" -Size 512 -Maskable $true
Create-PwaIcon -Path "$assetsDir\apple-touch-icon.png" -Size 180 -Maskable $false
