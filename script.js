class SlotMachine {
    constructor() {
        this.balance = 100.00;
        this.betAmount = 0.05;
        this.winAmount = 0.00;
        this.isSpinning = false;
        
        // Symbol definitions with realistic payout hierarchy
        this.symbols = [
            { name: 'DIAMOND', value: 'diamond', payout: 100, icon: 'diamond.svg', isWild: true }, // Wild - highest payout
            { name: 'TRIPLE SEVENS', value: 'triple-sevens', payout: 75, icon: 'triple-sevens.svg', isWild: false },
            { name: 'SEVEN', value: 'seven', payout: 50, icon: 'seven.svg', isWild: false },
            { name: 'LEMON', value: 'lemon', payout: 1.5, icon: 'lemon.svg', isWild: false },
            { name: 'WATERMELON', value: 'watermelon', payout: 1.2, icon: 'watermelon.svg', isWild: false },
            { name: 'PLUM', value: 'plum', payout: 1.0, icon: 'plum.svg', isWild: false },
            { name: 'CHERRY', value: 'cherries', payout: 0.5, icon: 'cherries.svg', isWild: false }
        ];
        
        // Create fixed vertical reels with weighted distributions
        this.initializeReels();
        
        // Paylines configuration - 5 zigzag lines using 3 positions per reel
        this.paylines = [
            [0, 0, 0], // Line 1: Top, Top, Top (straight across)
            [1, 1, 1], // Line 2: Middle, Middle, Middle (straight across)
            [2, 2, 2], // Line 3: Bottom, Bottom, Bottom (straight across)
            [0, 1, 2], // Line 4: Top, Middle, Bottom (diagonal)
            [2, 1, 0]  // Line 5: Bottom, Middle, Top (reverse diagonal)
        ];
        
        this.initializeElements();
        this.updateDisplay();
        this.bindEvents();
        this.initializeDisplay();
    }
    
    initializeElements() {
        this.reels = [
            document.getElementById('reel1'),
            document.getElementById('reel2'),
            document.getElementById('reel3')
        ];
        
        this.spinBtn = document.getElementById('spinBtn');
        this.balanceDisplay = document.querySelector('.control-panel .balance-amount');
        this.winDisplay = document.querySelector('.control-panel .win-amount');
        this.betDisplay = document.querySelector('.control-panel .bet-amount');
    }
    
    bindEvents() {
        this.spinBtn.addEventListener('click', () => this.spin());
        
        // Add bet adjustment buttons
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ' && !this.isSpinning) {
                e.preventDefault();
                this.spin();
            }
        });
        
        // Add debug mode (press 'd' to toggle)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'd' || e.key === 'D') {
                this.toggleDebugMode();
            }
            if (e.key === 's' || e.key === 'S') {
                this.displayCurrentReelState();
            }
            if (e.key === 'r' || e.key === 'R') {
                this.getReelStatistics();
            }
        });
    }
    
    toggleDebugMode() {
        const reelsContainer = document.querySelector('.reels-container');
        if (reelsContainer.style.border) {
            reelsContainer.style.border = '';
            reelsContainer.style.background = '';
        } else {
            reelsContainer.style.border = '3px solid #00ff00';
            reelsContainer.style.background = 'rgba(0, 255, 0, 0.1)';
            this.showPaylinePatterns();
            this.getReelStatistics();
            this.displayCurrentReelState();
        }
    }
    
    showPaylinePatterns() {
        // Visualize payline patterns
        console.log('Payline Patterns:');
        this.paylines.forEach((payline, index) => {
            console.log(`Line ${index + 1}:`, payline);
        });
    }
    
    displayCurrentReelState() {
        // Display current symbols on all reels
        console.log('Current Reel State:');
        for (let i = 0; i < 3; i++) {
            const symbols = this.getSymbolsAtPosition(i, this.reelPositions[i]);
            console.log(`Reel ${i + 1} (position ${this.reelPositions[i]}):`, 
                symbols.map(s => s ? s.name : 'undefined').join(' | '));
        }
    }
    
    getReelStatistics() {
        // Show symbol distribution statistics
        console.log('Reel Statistics:');
        for (let i = 0; i < 3; i++) {
            const reel = this.symbolReels[i];
            const counts = {};
            reel.forEach(symbol => {
                if (symbol && symbol.name) {
                    counts[symbol.name] = (counts[symbol.name] || 0) + 1;
                }
            });
            console.log(`Reel ${i + 1}:`, counts);
        }
    }
    
    updateDisplay() {
        // Update control panel displays
        this.balanceDisplay.textContent = `$${this.balance.toFixed(2)}`;
        this.winDisplay.textContent = `$${this.winAmount.toFixed(2)}`;
        this.betDisplay.textContent = `$${this.betAmount.toFixed(2)}`;
        
        // Update header balance display
        const headerBalance = document.querySelector('.game-header .balance-amount');
        if (headerBalance) {
            headerBalance.textContent = `$${this.balance.toFixed(2)}`;
        }
    }
    
    initializeDisplay() {
        // Initialize the display with symbols from the reels
        for (let i = 0; i < 3; i++) {
            const symbols = this.getSymbolsAtPosition(i, this.reelPositions[i]);
            this.displaySymbolsOnReel(i, symbols);
        }
    }
    
    displaySymbolsOnReel(reelIndex, symbols) {
        const reel = this.reels[reelIndex];
        reel.innerHTML = '';
        symbols.forEach(symbol => {
            const symbolElement = this.createSymbolElement(symbol);
            reel.appendChild(symbolElement);
        });
    }
    
    initializeReels() {
        // Create fixed vertical reels with weighted symbol distributions
        this.symbolReels = [
            this.createWeightedReel(), // Reel 1
            this.createWeightedReel(), // Reel 2  
            this.createWeightedReel()  // Reel 3
        ];
        
        // Current display positions for each reel (0-based index)
        this.reelPositions = [0, 0, 0];
        
        // Debug: Check if reels were created properly
        console.log('Reels initialized:', this.symbolReels.map((reel, i) => `Reel ${i + 1}: ${reel.length} symbols`));
        console.log('First few symbols of reel 1:', this.symbolReels[0].slice(0, 5).map(s => s ? s.name : 'undefined'));
    }
    
    createWeightedReel() {
        const reel = [];
        
        // Add symbols based on your specified weights
        // 25 cherries, 20 lemons, 15 watermelons, 20 plums, 5 diamonds, 5 triple sevens
        const symbolCounts = {
            'cherries': 25,
            'lemon': 20, 
            'watermelon': 15,
            'plum': 20,
            'diamond': 5,
            'triple-sevens': 5
        };
        
        // Add each symbol to the reel
        Object.entries(symbolCounts).forEach(([symbolValue, count]) => {
            const symbol = this.symbols.find(s => s.value === symbolValue);
            if (symbol) {
                for (let i = 0; i < count; i++) {
                    reel.push(symbol);
                }
            } else {
                console.error(`Symbol not found: ${symbolValue}`);
            }
        });
        
        // Shuffle the reel to randomize symbol positions
        return this.shuffleArray([...reel]);
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    getRandomReelPosition() {
        // Return a random position within the reel (ensuring we can show 3 symbols)
        return Math.floor(Math.random() * (this.symbolReels[0].length - 2));
    }
    
    getSymbolsAtPosition(reelIndex, position) {
        // Get 3 consecutive symbols from the reel starting at the given position
        const reel = this.symbolReels[reelIndex];
        const symbols = [];
        
        console.log(`Getting symbols for reel ${reelIndex + 1} at position ${position}`);
        console.log(`Reel length: ${reel.length}`);
        
        for (let i = 0; i < 3; i++) {
            const symbolIndex = (position + i) % reel.length;
            const symbol = reel[symbolIndex];
            console.log(`Position ${i}: index ${symbolIndex}, symbol:`, symbol);
            symbols.push(symbol);
        }
        
        return symbols;
    }
    
    createSymbolElement(symbol) {
        const symbolDiv = document.createElement('div');
        symbolDiv.className = 'symbol';
        
        // Check if symbol is valid
        if (!symbol) {
            console.error('Undefined symbol passed to createSymbolElement');
            symbolDiv.textContent = '?';
            return symbolDiv;
        }
        
        if (symbol.isWild) {
            symbolDiv.classList.add('wild-symbol');
        }
        
        // Create SVG element
        const svg = document.createElement('img');
        svg.src = `icons/${symbol.icon}`;
        svg.alt = symbol.name;
        svg.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: contain;
        `;
        
        symbolDiv.appendChild(svg);
        return symbolDiv;
    }
    
    checkLineWin(lineSymbols) {
        // Filter out any undefined symbols
        const validSymbols = lineSymbols.filter(symbol => symbol && symbol.name);
        if (validSymbols.length !== 3) {
            console.error('Invalid line symbols:', lineSymbols);
            return { isWin: false };
        }
        
        const wilds = validSymbols.filter(symbol => symbol.isWild);
        const nonWilds = validSymbols.filter(symbol => !symbol.isWild);
        
        // Special case: 3 wilds = highest payout
        if (wilds.length === 3) {
            return {
                isWin: true,
                symbol: wilds[0],
                wildCount: 3,
                isSpecialWin: true
            };
        }
        
        // Check for 3 of the same non-wild symbol (with or without wilds)
        if (nonWilds.length >= 1) {
            const symbolCounts = {};
            nonWilds.forEach(symbol => {
                symbolCounts[symbol.name] = (symbolCounts[symbol.name] || 0) + 1;
            });
            
            // Find the most common symbol
            let mostCommonSymbol = null;
            let maxCount = 0;
            for (const [name, count] of Object.entries(symbolCounts)) {
                if (count > maxCount) {
                    maxCount = count;
                    mostCommonSymbol = nonWilds.find(s => s.name === name);
                }
            }
            
            // Need exactly 3 symbols (matching + wilds)
            if (maxCount + wilds.length === 3) {
                // Check if it's a premium combination
                const isPremiumWin = mostCommonSymbol.name === 'TRIPLE SEVENS' || 
                                   mostCommonSymbol.name === 'SEVEN' ||
                                   (mostCommonSymbol.name === 'TRIPLE SEVENS' && wilds.length > 0);
                
                return {
                    isWin: true,
                    symbol: mostCommonSymbol,
                    wildCount: wilds.length,
                    isSpecialWin: isPremiumWin
                };
            }
        }
        
        return { isWin: false };
    }
    
    async spin() {
        if (this.isSpinning || this.balance < this.betAmount) {
            return;
        }
        
        this.isSpinning = true;
        this.spinBtn.disabled = true;
        this.spinBtn.textContent = 'SPINNING...';
        this.winAmount = 0;
        this.balance -= this.betAmount;
        console.log(`Bet placed: $${this.betAmount.toFixed(2)}, New balance: $${this.balance.toFixed(2)}`);
        this.updateDisplay();
        
        // Start spinning animation
        this.reels.forEach(reel => {
            reel.classList.add('spinning');
        });
        
        // Generate random positions for each reel and get symbols
        const reelSymbols = [];
        for (let i = 0; i < 3; i++) {
            const position = this.getRandomReelPosition();
            this.reelPositions[i] = position;
            const symbols = this.getSymbolsAtPosition(i, position);
            reelSymbols.push(symbols);
        }
        
        // Stop spinning after animation
        setTimeout(() => {
            this.stopSpinning(reelSymbols);
        }, 2000);
    }
    
    stopSpinning(reelSymbols) {
        this.reels.forEach((reel, reelIndex) => {
            reel.classList.remove('spinning');
        });
        
        // Display the new symbols
        for (let i = 0; i < 3; i++) {
            this.displaySymbolsOnReel(i, reelSymbols[i]);
        }
        
        // Check for wins
        this.checkWins(reelSymbols);
        
        this.isSpinning = false;
        this.spinBtn.disabled = false;
        this.spinBtn.textContent = 'SPIN';
        this.updateDisplay();
    }
    
    checkWins(reelSymbols) {
        let totalWin = 0;
        const winningLines = [];
        
        // Check each of the 5 paylines
        this.paylines.forEach((payline, lineIndex) => {
            const lineSymbols = payline.map((row, reelIndex) => {
                return reelSymbols[reelIndex][row];
            });
            
            // Check for winning combinations (including wilds)
            const winResult = this.checkLineWin(lineSymbols);
            
            if (winResult.isWin) {
                // Calculate win amount based on symbol payout and bet
                let basePayout = winResult.symbol.payout;
                
                // Apply special multipliers for premium wins
                if (winResult.isSpecialWin) {
                    if (winResult.symbol.name === 'DIAMOND' && winResult.wildCount === 3) {
                        basePayout = 100; // 3 wilds = 100x
                    } else if (winResult.symbol.name === 'TRIPLE SEVENS') {
                        basePayout = 75; // 3 triple sevens = 75x
                    } else if (winResult.symbol.name === 'SEVEN') {
                        basePayout = 50; // 3 sevens = 50x
                    }
                }
                
                const winAmount = basePayout * this.betAmount;
                totalWin += winAmount;
                
                winningLines.push({
                    line: lineIndex + 1, // 1-based line numbering
                    symbol: winResult.symbol,
                    amount: winAmount,
                    symbols: lineSymbols,
                    wildCount: winResult.wildCount,
                    isSpecialWin: winResult.isSpecialWin
                });
                
                const winType = winResult.isSpecialWin ? 'PREMIUM' : 'REGULAR';
                console.log(`Line ${lineIndex + 1} ${winType} win: ${winResult.symbol.name} - $${winAmount.toFixed(2)} (${winResult.wildCount} wilds)`);
            }
        });
        
        if (totalWin > 0) {
            this.winAmount = totalWin;
            this.balance += totalWin;
            console.log(`Win: $${totalWin.toFixed(2)}, New balance: $${this.balance.toFixed(2)}`);
            this.showWinAnimation(winningLines);
            this.showDetailedWinMessage(winningLines, totalWin);
        } else {
            console.log('No winning lines');
        }
    }
    
    showWinAnimation(winningLines) {
        // Highlight winning paylines
        const paylineElements = document.querySelectorAll('.payline');
        winningLines.forEach(win => {
            const lineIndex = win.line - 1; // Convert to 0-based index
            if (paylineElements[lineIndex]) {
                paylineElements[lineIndex].classList.add('win-animation');
                paylineElements[lineIndex].style.background = '#00ff00';
                paylineElements[lineIndex].style.boxShadow = '0 0 15px #00ff00';
                setTimeout(() => {
                    paylineElements[lineIndex].classList.remove('win-animation');
                    paylineElements[lineIndex].style.background = '#ffd700';
                    paylineElements[lineIndex].style.boxShadow = '0 0 8px rgba(255, 215, 0, 0.6)';
                }, 3000);
            }
        });
        
        // Highlight winning symbols in reels
        this.highlightWinningSymbols(winningLines);
    }
    
    highlightWinningSymbols(winningLines) {
        // Reset all symbol highlights
        const allSymbols = document.querySelectorAll('.reel .symbol');
        allSymbols.forEach(symbol => {
            symbol.style.background = '';
            symbol.style.boxShadow = '';
            symbol.style.border = '';
        });
        
        // Highlight symbols that are part of winning lines
        winningLines.forEach(win => {
            const payline = this.paylines[win.line - 1];
            payline.forEach((row, reelIndex) => {
                const reel = this.reels[reelIndex];
                const symbolElements = reel.querySelectorAll('.symbol');
                if (symbolElements[row]) {
                    symbolElements[row].style.background = 'linear-gradient(135deg, #00ff00 0%, #32cd32 100%)';
                    symbolElements[row].style.boxShadow = '0 0 15px #00ff00';
                    symbolElements[row].style.border = '2px solid #00ff00';
                }
            });
        });
        
        // Reset highlights after 3 seconds
        setTimeout(() => {
            allSymbols.forEach(symbol => {
                symbol.style.background = '';
                symbol.style.boxShadow = '';
                symbol.style.border = '';
            });
        }, 3000);
    }
    
    showWinMessage(amount) {
        // Create win message overlay
        const winOverlay = document.createElement('div');
        winOverlay.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
            color: #000;
            padding: 20px 40px;
            border-radius: 12px;
            font-size: 24px;
            font-weight: 900;
            z-index: 1000;
            box-shadow: 0 8px 32px rgba(255, 215, 0, 0.5);
            animation: winPulse 0.5s ease-in-out infinite;
        `;
        winOverlay.textContent = `WIN! $${amount.toFixed(2)}`;
        
        document.body.appendChild(winOverlay);
        
        setTimeout(() => {
            document.body.removeChild(winOverlay);
        }, 3000);
    }
    
    showDetailedWinMessage(winningLines, totalWin) {
        // Create detailed win message showing each winning line
        const winOverlay = document.createElement('div');
        winOverlay.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
            color: #000;
            padding: 20px;
            border-radius: 12px;
            font-size: 18px;
            font-weight: 700;
            z-index: 1000;
            box-shadow: 0 8px 32px rgba(255, 215, 0, 0.5);
            animation: winPulse 0.5s ease-in-out infinite;
            text-align: center;
            min-width: 300px;
            max-width: 400px;
        `;
        
        let messageHTML = `<div style="font-size: 24px; font-weight: 900; margin-bottom: 15px;">🎉 WIN! 🎉</div>`;
        messageHTML += `<div style="font-size: 20px; margin-bottom: 15px;">Total Win: $${totalWin.toFixed(2)}</div>`;
        
        if (winningLines.length > 1) {
            messageHTML += `<div style="font-size: 16px; margin-bottom: 10px;">Winning Lines:</div>`;
        }
        
        winningLines.forEach(win => {
            const wildText = win.wildCount > 0 ? ` (${win.wildCount} wild${win.wildCount > 1 ? 's' : ''})` : '';
            const winTypeText = win.isSpecialWin ? ' 🎉 PREMIUM WIN!' : '';
            messageHTML += `<div style="font-size: 14px; margin: 5px 0; padding: 5px; background: rgba(0,0,0,0.1); border-radius: 6px;">
                Line ${win.line}: ${win.symbol.name} - $${win.amount.toFixed(2)}${wildText}${winTypeText}
            </div>`;
        });
        
        winOverlay.innerHTML = messageHTML;
        
        document.body.appendChild(winOverlay);
        
        setTimeout(() => {
            if (document.body.contains(winOverlay)) {
                document.body.removeChild(winOverlay);
            }
        }, 4000);
    }
    
    // Utility methods for game management
    addFunds(amount) {
        this.balance += amount;
        this.updateDisplay();
    }
    
    adjustBet(amount) {
        const newBet = this.betAmount + amount;
        if (newBet >= 0.01 && newBet <= this.balance) {
            this.betAmount = newBet;
            this.updateDisplay();
        }
    }
    
    resetGame() {
        this.balance = 100.00;
        this.betAmount = 0.05;
        this.winAmount = 0.00;
        this.isSpinning = false;
        this.updateDisplay();
        
        // Reset reels to default state
        this.reels.forEach(reel => {
            reel.classList.remove('spinning');
        });
        
        this.spinBtn.disabled = false;
        this.spinBtn.textContent = 'SPIN';
    }
}

// Initialize the slot machine when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const slotMachine = new SlotMachine();
    
    // Add some additional UI interactions
    const addFundsBtn = document.querySelector('.add-funds-btn');
    const settingsBtn = document.querySelector('.settings-btn');
    const autoSpinBtn = document.querySelector('.auto-spin-btn');
    
    if (addFundsBtn) {
        addFundsBtn.addEventListener('click', () => {
            slotMachine.addFunds(10.00);
        });
    }
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            // Toggle bet amount
            slotMachine.adjustBet(0.05);
        });
    }
    
    if (autoSpinBtn) {
        autoSpinBtn.addEventListener('click', () => {
            // Auto spin feature
            if (!slotMachine.isSpinning) {
                slotMachine.spin();
            }
        });
    }
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'r':
            case 'R':
                slotMachine.resetGame();
                break;
            case '+':
            case '=':
                slotMachine.adjustBet(0.05);
                break;
            case '-':
                slotMachine.adjustBet(-0.05);
                break;
        }
    });
    
    // Update time display
    function updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        const timeElement = document.querySelector('.time');
        if (timeElement) {
            timeElement.textContent = timeString;
        }
    }
    
    updateTime();
    setInterval(updateTime, 1000);
    
    // Add some visual effects
    const gameContainer = document.querySelector('.game-container');
    if (gameContainer) {
        // Add subtle floating animation to coins
        const coins = document.querySelectorAll('.coins-left, .coins-right');
        coins.forEach((coin, index) => {
            coin.style.animation = `float ${2 + index * 0.5}s ease-in-out infinite`;
        });
    }
});

// Add floating animation for coins
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
    }
`;
document.head.appendChild(style);
