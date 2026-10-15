# Lightweight PowerShell Static File Web Server for Chhote Lal Property Dealer
$port = 8080
$root = $PSScriptRoot

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$port/"
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host " Chhote Lal Property Dealer Server Running at: $prefix" -ForegroundColor Cyan
    Write-Host " Admin Portal: ${prefix}admin/login.html" -ForegroundColor Yellow
    Write-Host " Press Ctrl+C to stop the server." -ForegroundColor Gray
    Write-Host "==========================================================" -ForegroundColor Green

    $mimeTypes = @{
        ".html" = "text/html; charset=utf-8"
        ".css"  = "text/css; charset=utf-8"
        ".js"   = "application/javascript; charset=utf-8"
        ".json" = "application/json; charset=utf-8"
        ".svg"  = "image/svg+xml"
        ".jpg"  = "image/jpeg"
        ".jpeg" = "image/jpeg"
        ".png"  = "image/png"
        ".webp" = "image/webp"
        ".xml"  = "application/xml"
        ".txt"  = "text/plain"
    }

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $path = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($path)) {
            $path = "index.html"
        }

        $filePath = Join-Path $root $path

        if ((Test-Path $filePath -PathType Container)) {
            $filePath = Join-Path $filePath "index.html"
        }

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
            $response.ContentType = $mime
            
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $notFoundPath = Join-Path $root "404.html"
            if (Test-Path $notFoundPath) {
                $bytes = [System.IO.File]::ReadAllBytes($notFoundPath)
                $response.ContentType = "text/html; charset=utf-8"
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $bytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            }
        }
        $response.Close()
    }
} finally {
    $listener.Stop()
    $listener.Close()
}
