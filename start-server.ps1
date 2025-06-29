# Find Animals Game - Server Launcher
Write-Host "🎯 Find Animals Game - Server Launcher 🎯" -ForegroundColor Green
Write-Host ""

# Check if Python is available
$pythonAvailable = $false
try {
    $pythonVersion = python --version 2>$null
    if ($pythonVersion) {
        $pythonAvailable = $true
        Write-Host "✅ Python detected: $pythonVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Python not found" -ForegroundColor Red
}

# Check if Node.js is available
$nodeAvailable = $false
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        $nodeAvailable = $true
        Write-Host "✅ Node.js detected: $nodeVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Node.js not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "Available options:" -ForegroundColor Yellow

if ($pythonAvailable) {
    Write-Host "1. Start Python HTTP Server (Port 8000)" -ForegroundColor Cyan
}

if ($nodeAvailable) {
    Write-Host "2. Start Node.js Live Server (Port 3000)" -ForegroundColor Cyan
}

Write-Host "3. Open game directly in browser" -ForegroundColor Cyan
Write-Host "4. Show deployment instructions" -ForegroundColor Cyan
Write-Host ""

$choice = Read-Host "Enter your choice (1-4)"

switch ($choice) {
    "1" {
        if ($pythonAvailable) {
            Write-Host ""
            Write-Host "🚀 Starting Python HTTP Server..." -ForegroundColor Green
            Write-Host "📱 Local access: http://localhost:8000" -ForegroundColor Yellow
            Write-Host "🌐 Network access: http://$(Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias 'Wi-Fi' | Select-Object -First 1).IPAddress:8000" -ForegroundColor Yellow
            Write-Host "⏹️ Press Ctrl+C to stop the server" -ForegroundColor Red
            Write-Host ""
            
            # Open browser
            Start-Process "http://localhost:8000"
            
            # Start server
            python -m http.server 8000
        } else {
            Write-Host "❌ Python is not available. Please install Python from https://python.org" -ForegroundColor Red
        }
    }
    
    "2" {
        if ($nodeAvailable) {
            Write-Host ""
            Write-Host "🚀 Installing dependencies and starting Node.js server..." -ForegroundColor Green
            npm install
            if ($LASTEXITCODE -eq 0) {
                Write-Host "📱 Local access: http://localhost:3000" -ForegroundColor Yellow
                npm start
            } else {
                Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ Node.js is not available. Please install Node.js from https://nodejs.org" -ForegroundColor Red
        }
    }
    
    "3" {
        Write-Host ""
        Write-Host "🎮 Opening game in your default browser..." -ForegroundColor Green
        Start-Process "index.html"
    }
    
    "4" {
        Write-Host ""
        Write-Host "📖 Opening deployment guide..." -ForegroundColor Green
        Start-Process "DEPLOYMENT.md"
    }
    
    default {
        Write-Host "❌ Invalid choice. Please run the script again." -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
