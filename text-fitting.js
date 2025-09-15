// Text Fitting functionality for drag and drop activity
class TextFitting {
    constructor(dropZones) {
        this.dropZones = dropZones;
    }

    // Update the drop zones reference when zones change
    updateDropZones(dropZones) {
        this.dropZones = dropZones;
    }

    // Measure text size using a detached clone for accurate measurement
    measureTextSize(text, fontSize, fontFamily, fontWeight) {
        const temp = document.createElement("span");
        temp.textContent = text;
        temp.style.fontSize = fontSize + "px";
        temp.style.fontFamily = fontFamily || 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif';
        temp.style.fontWeight = fontWeight || '700';
        temp.style.position = "absolute";
        temp.style.visibility = "hidden";
        temp.style.whiteSpace = "nowrap";
        temp.style.padding = "0";
        temp.style.margin = "0";
        temp.style.lineHeight = "1";
        document.body.appendChild(temp);

        const width = temp.offsetWidth;
        const height = temp.offsetHeight;
        document.body.removeChild(temp);
        return { width, height };
    }

    // --- Auto-fit the placed label's font size to the drop zone or grid cell ---
    fitLabelToZone(labelEl, containerEl = labelEl, { minPx = 10, maxPx } = {}) {
        const span = labelEl.querySelector('.label-text') || labelEl.querySelector('span') || labelEl;
        const termText = span.textContent.trim();
        
        console.log(`🔍 FITTING TEXT: "${termText}"`);
        console.log(`📦 labelEl:`, labelEl);
        console.log(`📦 containerEl:`, containerEl);

        // Compute available space based on whether this is a multi-term or single-term zone
        const tryFit = () => {
            // Get the drop zone element that contains this label
            const dropZone = labelEl.closest('.drop-zone');
            if (!dropZone) {
                console.log(`❌ No drop zone found, retrying...`);
                requestAnimationFrame(tryFit);
                return;
            }

            // Determine if this is a multi-term zone by checking the zone data
            const zoneId = dropZone.dataset.zoneId;
            const zone = this.dropZones.find(z => z.id === zoneId);
            const isMultiTermZone = zone && (zone.maxAllowed === null || zone.maxAllowed > 1);
            
            console.log(`🏷️ Zone ID: ${zoneId}`);
            console.log(`🏷️ Zone data:`, zone);
            console.log(`🏷️ Is multi-term zone: ${isMultiTermZone}`);

            let availableWidth, availableHeight;
            
            if (isMultiTermZone) {
                // For multi-term zones: use the individual grid cell dimensions (containerEl)
                const cellWidth = containerEl.clientWidth;
                const cellHeight = containerEl.clientHeight;
                
                console.log(`📐 Grid cell dimensions: ${cellWidth}x${cellHeight}`);
                
                if (cellWidth === 0 || cellHeight === 0) {
                    console.log(`❌ Cell dimensions are 0, retrying...`);
                    requestAnimationFrame(tryFit);
                    return;
                }
                
                // Use 90% of the individual cell size for multi-term zones
                availableWidth = cellWidth * 0.9;
                availableHeight = cellHeight * 0.9;
                
                console.log(`📐 Available space (90% of cell): ${availableWidth}x${availableHeight}`);
            } else {
                // For single-term zones: the label box fills 100% of the zone,
                // so we calculate text size based on 90% of the label box dimensions
                const labelBox = labelEl;
                const labelWidth = labelBox.clientWidth;
                const labelHeight = labelBox.clientHeight;
                
                console.log(`📐 Label box dimensions: ${labelWidth}x${labelHeight}`);
                
                if (labelWidth === 0 || labelHeight === 0) {
                    console.log(`❌ Label dimensions are 0, retrying...`);
                    requestAnimationFrame(tryFit);
                    return;
                }
                
                // Use 90% of the label box size (which fills the entire zone)
                availableWidth = labelWidth * 0.9;
                availableHeight = labelHeight * 0.9;
                
                console.log(`📐 Available space (90% of label): ${availableWidth}x${availableHeight}`);
            }

            // Read the padding and border from the placed-label itself
            const cs = getComputedStyle(labelEl);
            const padL = parseFloat(cs.paddingLeft) || 0;
            const padR = parseFloat(cs.paddingRight) || 0;
            const padT = parseFloat(cs.paddingTop) || 0;
            const padB = parseFloat(cs.paddingBottom) || 0;
            const borderL = parseFloat(cs.borderLeftWidth) || 0;
            const borderR = parseFloat(cs.borderRightWidth) || 0;
            const borderT = parseFloat(cs.borderTopWidth) || 0;
            const borderB = parseFloat(cs.borderBottomWidth) || 0;

            console.log(`📏 Padding: L=${padL}, R=${padR}, T=${padT}, B=${padB}`);
            console.log(`📏 Borders: L=${borderL}, R=${borderR}, T=${borderT}, B=${borderB}`);

            // Subtract padding and borders from available space
            const textWidth = availableWidth - padL - padR - borderL - borderR;
            const textHeight = availableHeight - padT - padB - borderT - borderB;

            console.log(`📏 Final text space: ${textWidth}x${textHeight}`);

            // Ensure minimum dimensions
            if (textWidth <= 0 || textHeight <= 0) {
                console.log(`❌ Text space too small: ${textWidth}x${textHeight}`);
                requestAnimationFrame(tryFit);
                return;
            }

            // Calculate maximum font size based on available height
            // Use different percentages for single-term vs multi-term zones
            const heightPercentage = isMultiTermZone ? 0.75 : 0.85; // Less conservative for single-term zones
            const maxFontSize = Math.floor(textHeight * heightPercentage);
            const ceiling = maxFontSize; // Use the calculated size without safety bounds

            // Debug logging to see what dimensions we're working with
            console.log(`Font sizing for "${span.textContent.trim()}":`, {
                availableWidth,
                availableHeight,
                textWidth,
                textHeight,
                maxFontSize,
                ceiling
            });

            // Start with a very small minimum to allow text to fit in small zones
            let lo = Math.max(1, minPx), hi = (typeof maxPx === 'number' ? maxPx : ceiling), best = Math.max(1, minPx);
            
            console.log(`🔍 Binary search range: ${lo}px to ${hi}px`);
            console.log(`🔍 Text to fit: "${termText}" (${termText.length} chars)`);

            // Binary search for largest size that fits within the calculated available space
            let iteration = 0;
            while (lo <= hi) {
                iteration++;
                const mid = Math.floor((lo + hi) / 2);
                
                // Measure text size using detached clone (no CSS constraints)
                const { width: actualWidth, height: actualHeight } = this.measureTextSize(termText, mid, cs.fontFamily, cs.fontWeight);
                
                // Use different safety margins for single-term vs multi-term zones
                const widthMargin = isMultiTermZone ? 0.9 : 0.95; // Less conservative for single-term zones
                const heightMargin = isMultiTermZone ? 0.9 : 0.95;
                const maxAllowedWidth = textWidth * widthMargin;
                const maxAllowedHeight = textHeight * heightMargin;
                const fits = (actualWidth <= maxAllowedWidth) && (actualHeight <= maxAllowedHeight);

                console.log(`🔍 Iteration ${iteration}: Trying ${mid}px - DetachedClone: ${actualWidth}x${actualHeight}, Max allowed: ${maxAllowedWidth}x${maxAllowedHeight}, Fits: ${fits}`);

                if (fits) {
                    best = mid;
                    lo = mid + 1;
                    console.log(`✅ ${mid}px fits, trying larger...`);
                } else {
                    hi = mid - 1;
                    console.log(`❌ ${mid}px too big, trying smaller...`);
                }
            }
            
            console.log(`🔍 Binary search completed after ${iteration} iterations`);

            span.style.fontSize = best + 'px';
            
            // ✨ Allow word wrapping again after sizing is complete
            span.style.whiteSpace = 'normal';
            span.style.display = 'block';
            span.style.wordBreak = 'break-word';
            span.style.overflowWrap = 'break-word';
            span.style.textAlign = 'center';
            span.style.maxWidth = '';
            span.style.overflow = '';
            
            // Debug final result using detached clone measurement
            const { width: finalWidth, height: finalHeight } = this.measureTextSize(termText, best, cs.fontFamily, cs.fontWeight);
            console.log(`Final font size for "${span.textContent.trim()}": ${best}px, actual text size: ${finalWidth}x${finalHeight}, available: ${textWidth}x${textHeight}`);
        };

        requestAnimationFrame(tryFit);
    }

    // Refit all placed labels (call on resize, etc.)
    fitAllPlacedLabels(activityDropZones) {
        console.log(`🔄 FITTING ALL PLACED LABELS`);
        const labels = activityDropZones?.querySelectorAll('.placed-label') || [];
        console.log(`🔄 Found ${labels.length} placed labels`);
        
        labels.forEach((pl, index) => {
            const dropZone = pl.closest('.drop-zone');
            const isMultiTermZone = dropZone && dropZone.querySelector('.placed-labels')?.classList.contains('grid-layout');
            
            console.log(`🔄 Label ${index + 1}: Multi-term zone: ${isMultiTermZone}`);
            
            if (isMultiTermZone) {
                // For multi-term zones: fit to individual cell
                console.log(`🔄 Fitting to individual cell (pl, pl)`);
                this.fitLabelToZone(pl, pl);
            } else {
                // For single-term zones: fit to entire zone
                console.log(`🔄 Fitting to entire zone (pl, dropZone)`);
                this.fitLabelToZone(pl, dropZone);
            }
        });
    }

    // Layout placed labels within a zone (handles grid vs single-term layout)
    layoutPlacedLabels(zoneElement, zone) {
        const container = zoneElement.querySelector('.placed-labels');
        if (!container) return;
        
        // Determine if this is a multi-term zone
        const isMultiTermZone = zone.maxAllowed === null || zone.maxAllowed > 1;
        
        if (isMultiTermZone) {
            // For multi-term zones: use grid layout
            const placed = container.querySelectorAll('.placed-label').length;
            const rows = Math.max(1, zone.maxAllowed || placed);
            
            console.log(`Grid layout for zone ${zone.id}: ${placed} labels, ${rows} rows, maxAllowed: ${zone.maxAllowed}`);
            
            container.style.setProperty('--rows', rows);
            container.classList.add('grid-layout');
            
            // CSS handles the grid layout automatically
        } else {
            // For single-term zones: no grid, just center the label
            console.log(`Single-term layout for zone ${zone.id}: no grid needed`);
            
            container.style.removeProperty('--rows');
            container.classList.remove('grid-layout');
            
            // CSS handles the flex layout automatically
        }
        
        // After layout is complete, fit all labels in this zone
        const labels = container.querySelectorAll('.placed-label');
        console.log(`🎯 LAYOUT: Fitting ${labels.length} labels in zone ${zone.id} (multi-term: ${isMultiTermZone})`);
        
        labels.forEach((label, index) => {
            console.log(`🎯 LAYOUT: Fitting label ${index + 1} in zone ${zone.id}`);
            if (isMultiTermZone) {
                // For multi-term zones: fit to individual cell
                console.log(`🎯 LAYOUT: Using individual cell fitting (label, label)`);
                this.fitLabelToZone(label, label);
            } else {
                // For single-term zones: fit to entire zone
                console.log(`🎯 LAYOUT: Using entire zone fitting (label, zoneElement)`);
                this.fitLabelToZone(label, zoneElement);
            }
        });
    }
}
