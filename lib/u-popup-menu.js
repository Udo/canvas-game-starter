(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // CommonJS
        module.exports = factory(require('jquery'));
    } else {
        // Browser globals
        root.showPopupMenu = factory(root.$);
    }
}(typeof self !== 'undefined' ? self : this, function ($) {
    'use strict';

    let showPopupMenu = (x, y, items, prop = {}) => {
        document.querySelectorAll('.vp-popup-menu').forEach(menu => {
            if(menu.parentNode) menu.parentNode.removeChild(menu);
        });
        
        let container = prop.container || document.body;
        let menu = $('<div class="vp-popup-menu">').css({
            position: 'absolute',
            left: (x|0) + 'px', 
            top: (y|0) + 'px'
        })[0];

        let elems = [];
        if(!items || !items.length) {
            $(menu).append(`<div class="vp-popup-empty">${prop.emptyText || 'No items'}</div>`);
        } else {
            items.forEach((it, idx) => {
                let label = typeof it === 'string' ? it : (it.label || it.screen || it.name || JSON.stringify(it));
                let $item = $(`<div class="vp-popup-item" tabindex="0">${label}</div>`)
                    .attr('data-idx', idx)
                    .on('click', ev => { ev.stopPropagation(); try { (prop.onSelect || (()=>{}))(it); } catch(e){ console.error(e); } removeMenu(); })
                    .on('keydown', e => { if(e.key === 'Enter') { e.preventDefault(); $item[0].click(); } });
                $(menu).append($item[0]);
                elems.push({el: $item[0], data: it});
            });
        }

        let focusedIndex = elems.length ? 0 : -1;
        let focusAt = i => {
            elems.forEach((it, idx) => { $(it.el).removeClass('focused'); if(idx === i) { $(it.el).addClass('focused'); try{ it.el.focus(); }catch(e){} } });
            focusedIndex = i;
        };

        let removeMenu = () => { 
            if(menu.parentNode) menu.parentNode.removeChild(menu); 
            $(document).off('mousedown', onDoc).off('keydown', onKey); 
            $(window).off('resize', onResize); 
        };
        let onDoc = ev => { if(!menu.contains(ev.target)) removeMenu(); };
        let onResize = () => reposition();
        let onKey = ev => {
            if(!elems.length) { if(ev.key === 'Escape') removeMenu(); return; }
            if(ev.key === 'Escape') { ev.preventDefault(); removeMenu(); return; }
            if(ev.key === 'ArrowDown') { ev.preventDefault(); focusAt((focusedIndex + 1) % elems.length); return; }
            if(ev.key === 'ArrowUp') { ev.preventDefault(); focusAt((focusedIndex - 1 + elems.length) % elems.length); return; }
            if(ev.key === 'Home') { ev.preventDefault(); focusAt(0); return; }
            if(ev.key === 'End') { ev.preventDefault(); focusAt(elems.length - 1); return; }
            if(ev.key === 'Enter') { ev.preventDefault(); if(focusedIndex >= 0) elems[focusedIndex].el.click(); }
        };

        container.appendChild(menu);
        let reposition = () => {
            let mRect = menu.getBoundingClientRect();
            let winW = window.innerWidth, winH = window.innerHeight;
            let left = parseInt($(menu).css('left'),10) || 0, top = parseInt($(menu).css('top'),10) || 0;
            if(mRect.right > winW) left = Math.max(4, winW - Math.ceil(mRect.width) - 8);
            if(mRect.bottom > winH) top = Math.max(4, winH - Math.ceil(mRect.height) - 8);
            if(left < 4) left = 4; if(top < 4) top = 4;
            $(menu).css({left: left + 'px', top: top + 'px'});
        };

        $(document).on('mousedown', onDoc).on('keydown', onKey);
        $(window).on('resize', onResize);
        if(elems.length) { focusAt(0); }
        setTimeout(reposition, 0);
        return menu;
    };

    return showPopupMenu;
}));