(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // CommonJS
        module.exports = factory(require('jquery'));
    } else {
        // Browser globals
        root.TilingViewportManager = factory(root.$);
    }
}(typeof self !== 'undefined' ? self : this, function ($) {
    'use strict';

    // Note: This module expects showPopupMenu to be available globally
    // or you may need to adjust the dependency list above to include it

    let TilingViewportManager = function(container, options = {}) {
        
        let idCounter = 1, rootNode = null, focusedPane = null, containerEl = null;
        let nextId = () => 'vp_' + (idCounter++);
        let paneMeta = new Map();
        let pendingViewLoads = [];
        let defaultoptions = {
            minPaneSize: 100,
            keyboard: true,
            showHelp: true,
            closeTransitionTimeout: 400,
            toolbarButtons: ['split-v','split-h','views','close'],
            standardViewList: [],
            cssVars: { '--vp-duration': '.22s', '--vp-easing': 'ease' }
        };
        options = Object.assign({}, defaultoptions, options);

        let createPane = (content, props = {}) => {
            let id = nextId();
            let $el = $('<div class="viewport-pane">').attr('data-id', id);
            if(props.title) $el.attr('data-title', props.title);
            $el.html(content || `<div style="opacity:.65;">Use Alt+&lt;H V O X ↑ ← → ↓&gt;</div>`)
               .on('mousedown', () => focusPaneByEl($el[0]));
            attachPaneToolbar($el[0]);
            paneMeta.set(id, {id, canClose: true, canSplit: true, title: props.title, ...props});
            if(props.view?.screen) pendingViewLoads.push({id, view: props.view});
            return {type: 'pane', id, el: $el[0]};
        };

        let buildInitial = () => { rootNode = createPane(); $(containerEl).html('').append(rootNode.el); focusPane(rootNode); };
        let focusPane = node => { if(!node || node.type !== 'pane') return; if(focusedPane?.el) $(focusedPane.el).removeClass('focused'); focusedPane = node; $(node.el).addClass('focused'); };
        let focusPaneByEl = el => focusPane(findNodeById(rootNode, $(el).attr('data-id')));
        let findNodeById = (node, id) => !node ? null : node.type === 'pane' ? (node.id === id ? node : null) : node.children.map(ch => findNodeById(ch, id)).find(r=>r);
        let getNodeById = id => findNodeById(rootNode, id) || null;
        let findParentPath = (node, id, path=[]) => !node ? null : node.type === 'pane' ? (node.id === id ? path : null) : node.children.map(ch => findParentPath(ch, id, path.concat(node))).find(r=>r);
        let paneList = (node, acc=[]) => !node ? acc : node.type === 'pane' ? (acc.push(node), acc) : (node.children.forEach(ch => paneList(ch, acc)), acc);
        let renormalizeSizes = splitNode => { let total = splitNode.sizes.reduce((a,b)=>a+b,0)||1; splitNode.sizes = splitNode.sizes.map(s=>s/total); };
        let replaceChild = (splitNode, oldChild, newChild) => { let i = splitNode.children.indexOf(oldChild); if(i>=0) splitNode.children.splice(i,1,newChild); };

        let split = (direction, newPaneProps = {}) => {
            if(!focusedPane) return;
            let meta = paneMeta.get(focusedPane.id);
            if(meta?.canSplit === false) return;
            
            let paneRect = focusedPane.el.getBoundingClientRect();
            let availableSpace = direction === 'row' ? paneRect.width : paneRect.height;
            let requiredSpace = 2 * options.minPaneSize;
            if(availableSpace < requiredSpace) {
                //console.log(`Cannot split: available space ${availableSpace}px < required ${requiredSpace}px`);
                return;
            }
            
            let parentPath = findParentPath(rootNode, focusedPane.id);
            let newPane = createPane(undefined, newPaneProps);
            let animatedSplit = null, newIndex = -1;
            if(!parentPath?.length) {
                rootNode = {type:'split', direction, children:[focusedPane, newPane], sizes:[1,0]};
                animatedSplit = rootNode; newIndex = 1;
            } else {
                let parent = parentPath.at(-1);
                if(parent.type === 'split' && parent.direction === direction) {
                    let idx = parent.children.indexOf(focusedPane);
                    parent.children.splice(idx+1, 0, newPane);
                    parent.sizes = parent.sizes || parent.children.map(()=>1);
                    parent.sizes.splice(idx+1, 0, 0);
                    renormalizeSizes(parent);
                    animatedSplit = parent; newIndex = idx+1;
                } else if(parent.type === 'split' && parent.direction !== direction && parent.children.length === 1) {
                    parent.direction = direction; parent.children.push(newPane); parent.sizes = [1,0];
                    animatedSplit = parent; newIndex = parent.children.length-1;
                } else {
                    let idx = parent.children.indexOf(focusedPane);
                    let created = {type:'split', direction, children:[focusedPane, newPane], sizes:[1,0]};
                    parent.children.splice(idx, 1, created);
                    animatedSplit = created; newIndex = 1;
                }
            }
            render();
            if(animatedSplit && newIndex >= 0) {
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    animatedSplit.sizes = animatedSplit.children.map(()=>1);
                    renormalizeSizes(animatedSplit);
                    animatedSplit.children.forEach((ch,i) => ch.el && (ch.el.style.flex = `${animatedSplit.sizes[i]} 1 0`));
                }));
            }
            focusPane(newPane); return newPane;
        };

        let splitVertical = () => split('row');
        let splitHorizontal = () => split('col');

        let closeFocused = () => {
            if(!focusedPane) return;
            let meta = paneMeta.get(focusedPane.id);
            if(meta?.canClose === false) return;
            if(rootNode === focusedPane) { buildInitial(); return; }
            if(typeof meta?.onUnload === 'function') meta.onUnload(focusedPane.id); 
            if(typeof meta?.view?.onUnload === 'function') meta.view.onUnload(focusedPane.id); 
            let parentPath = findParentPath(rootNode, focusedPane.id);
            if(!parentPath?.length) return;
            let parent = parentPath.at(-1);
            if(parent.type !== 'split') return;
            let idx = parent.children.indexOf(focusedPane);

            let oldSizes = (parent.sizes || parent.children.map(()=>1)).slice();
            let oldSize = oldSizes[idx] || 0;
            let remaining = 1 - oldSize;
            let newSizes = oldSizes.slice();
            if(remaining > 0) {
                for(let i=0;i<newSizes.length;i++) if(i!==idx) newSizes[i] = newSizes[i] / remaining; else newSizes[i] = 0;
            } else {
                let count = parent.children.length - 1 || 1;
                for(let i=0;i<newSizes.length;i++) newSizes[i] = (i===idx) ? 0 : 1/count;
            }
            parent.sizes = newSizes;
            parent.children.forEach((ch,i) => ch.el && (ch.el.style.flex = `${parent.sizes[i]} 1 0`));
            if(focusedPane.el) {
                focusedPane.el.style.transition = (focusedPane.el.style.transition || '') + ', opacity .18s ease';
                focusedPane.el.style.opacity = '0';
            }
            let done = false;
            let cleanup = () => {
                if(done) return; done = true;
                parent.children.splice(idx,1);
                parent.sizes?.splice(idx,1);
                paneMeta.delete(focusedPane.id);
                if(parent.children.length === 1) {
                    let only = parent.children[0];
                    parentPath.length === 1 ? rootNode = only : replaceChild(parentPath.at(-2), parent, only);
                } else if(parent.sizes) renormalizeSizes(parent);
                render(); focusPane(paneList(rootNode)[0]);
            };
            let onEnd = ev => { if(ev.target === focusedPane.el && (ev.propertyName === 'opacity' || ev.propertyName === 'flex')) { focusedPane.el.removeEventListener('transitionend', onEnd); cleanup(); } };
            if(focusedPane.el) focusedPane.el.addEventListener('transitionend', onEnd);
            setTimeout(() => cleanup(), 350);
        };

        let nextPane = (node, currentId, options={direction:1}) => { let list = paneList(node); if(!list.length) return null; let idx = list.findIndex(p=>p.id===(currentId||(focusedPane?.id)))||0; return list[(idx+options.direction+list.length)%list.length]; };
        let focusNext = () => { let n = nextPane(rootNode); if(n) focusPane(n); };
        let focusPrev = () => { let n = nextPane(rootNode, null, {direction:-1}); if(n) focusPane(n); };

        let serialize = (node=rootNode) => {
            let ser = n => !n ? null : n.type==='pane' ? 
                {type:'pane', id:n.id, title:paneMeta.get(n.id)?.title, props:{canClose:paneMeta.get(n.id)?.canClose!==false, canSplit:paneMeta.get(n.id)?.canSplit!==false}, view:paneMeta.get(n.id)?.view||null} :
                {type:'split', direction:n.direction, sizes:(n.sizes||[]).slice(), children:n.children.map(ser)};
        return {focus: focusedPane?.id, layout: ser(node)};
        };

        let restore = data => {
            if(!data) return;
            let wrapper = data.layout ? data : {layout:data};
            paneMeta.clear(); idCounter = 1; pendingViewLoads.length = 0;
            let idNums = [];
            let build = l => l && l.type==='pane' ? 
                (() => { let pane = createPane(undefined, {title:l.title, canClose:l.props?.canClose, canSplit:l.props?.canSplit, view:l.view});
                    if(l.id) { pane.el.dataset.id = pane.id = l.id; let n=parseInt(l.id.split('_')[1],10); if(!isNaN(n)) idNums.push(n); }
                    let meta = paneMeta.get(pane.id); if(meta) { Object.assign(meta, l.props||{}, {title:l.title, view:l.view}); if(pane.el && l.title) pane.el.dataset.title = l.title; paneMeta.set(pane.id, meta); }
                    return pane; })() :
                l && l.type==='split' ? {type:'split', direction:l.direction||'row', children:(l.children||[]).map(build).filter(Boolean), sizes:(l.sizes||[]).slice()} : null;
            rootNode = build(wrapper.layout) || createPane();
            if(idNums.length) idCounter = Math.max(...idNums) + 1;
            render();
            pendingViewLoads.forEach(v => v.view && loadView(v.id, v.view)); pendingViewLoads.length = 0;
            focusPane(wrapper.focus ? findNodeById(rootNode, wrapper.focus) || paneList(rootNode)[0] : paneList(rootNode)[0]);
        };

        let render = () => { if(!containerEl) return; $(containerEl).empty().append(renderNode(rootNode)); injectHelpOverlay(); };

        let renderNode = node => {
            if(node.type==='pane') return node.el;
            node.el = node.el || $('<div>')[0];
            $(node.el).empty().addClass(`vp-split ${node.direction}`);
            if(!node.sizes || node.sizes.length !== node.children.length) { node.sizes = node.children.map(()=>1); renormalizeSizes(node); }
            node.children.forEach((ch,i) => {
                let chEl = renderNode(ch); $(chEl).css('flex', `${node.sizes[i]} 1 0`); node.el.appendChild(chEl);
                if(i < node.children.length-1) { let div = $('<div>').addClass(`vp-divider ${node.direction}`)[0]; setupDivider(div, node, i); node.el.appendChild(div); }
            });
            return node.el;
        };

        let setupDivider = (div, splitNode, leftIdx) => {
            $(div).on('mousedown', e => {
                e.preventDefault(); $(div).addClass('dragging');
                $(containerEl).addClass('vp-no-transition');
                let isRow = splitNode.direction === 'row';
                let startPos = isRow ? e.clientX : e.clientY;
                let childRects = splitNode.children.map(ch => ch.el.getBoundingClientRect());
                let prop = isRow ? 'width' : 'height';
                let startPixels = childRects.map(r => r[prop]);
                let [aStartPx, bStartPx] = [startPixels[leftIdx], startPixels[leftIdx+1]];
                let totalPixels = startPixels.reduce((a,b)=>a+b,0);
                let onMove = ev => {
                    let curPos = isRow ? ev.clientX : ev.clientY;
                    let [newApx, newBpx] = [aStartPx + curPos - startPos, bStartPx - curPos + startPos];
                    if(newApx < options.minPaneSize) [newApx, newBpx] = [options.minPaneSize, aStartPx + bStartPx - options.minPaneSize];
                    if(newBpx < options.minPaneSize) [newApx, newBpx] = [aStartPx + bStartPx - options.minPaneSize, options.minPaneSize];
                    startPixels[leftIdx] = newApx; startPixels[leftIdx+1] = newBpx;
                    splitNode.sizes = startPixels.map(p => p / totalPixels);
                    splitNode.children.forEach((ch,i)=> {
                        if(ch.el) {
                            let flexValue = `${splitNode.sizes[i]} 1 0`;
                            $(ch.el).css('flex', flexValue);
                        }
                    });
                };
                let onUp = () => { 
                    $(div).removeClass('dragging'); 
                    $(containerEl).removeClass('vp-no-transition');
                    $(document).off('mousemove', onMove).off('mouseup', onUp); 
                };
                $(document).on('mousemove', onMove).on('mouseup', onUp);
            });
            $(div).on('dblclick', () => {
                $(containerEl).addClass('vp-no-transition');
                let len = splitNode.sizes.length; splitNode.sizes = splitNode.sizes.map(()=>1/len);
                splitNode.children.forEach((ch,i)=> ch.el && $(ch.el).css('flex', `${splitNode.sizes[i]} 1 0`));
                setTimeout(() => $(containerEl).removeClass('vp-no-transition'), 0);
            });
        };

        let attachPaneToolbar = el => {
            let bar = $('<div>').addClass('vp-pane-toolbar').html(`
                <button title="Split Vert" data-act="split-v" aria-label="Split vertically">
                    <svg class="vp-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <rect x="1" y="4" width="8" height="16" rx="1" fill="currentColor" />
                        <rect x="15" y="4" width="8" height="16" rx="1" fill="currentColor" />
                    </svg>
                </button>
                <button title="Split Horiz" data-act="split-h" aria-label="Split horizontally">
                    <svg class="vp-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <rect x="3" y="1" width="18" height="8" rx="1" fill="currentColor" />
                        <rect x="3" y="15" width="18" height="8" rx="1" fill="currentColor" />
                    </svg>
                </button>
                <button title="Views" data-act="views">O</button>
                <button title="Close" data-act="close">X</button>`)[0];
            el.appendChild(bar);
            $(bar).on('mousedown', ev => ev.stopPropagation());
            $(bar).on('click', ev => { ev.stopPropagation(); focusPaneByEl(el);
                let button = ev.target.closest('button[data-act]');
                let act = button ? button.getAttribute('data-act') : null; 
                if(act==='split-v') splitVertical(); else if(act==='split-h') splitHorizontal(); else if(act==='close') closeFocused();
                else if(act==='views') {
                    // compute button position
                    let rect = button.getBoundingClientRect();
                    let items = options.standardViewList.slice();
                    showPopupMenu(rect.left, rect.bottom, items, { onSelect: it => {
                        // support string or object {screen}
                        let view = typeof it === 'string' ? {screen: it} : (it.screen ? it : {screen: it});
                        loadView(el.dataset.id, view);
                    }, container: document.body, emptyText: 'No views available' });
                }
            });
            refreshToolbarState(el.dataset.id);
        };

        let refreshToolbarState = paneId => {
            let meta = paneMeta.get(paneId); let el = $(containerEl).find(`.viewport-pane[data-id="${paneId}"]`)[0];
            if(!el) return; let bar = $(el).find('.vp-pane-toolbar')[0]; if(!bar) return;
            let [canSplit, canClose] = [!meta||meta.canSplit!==false, !meta||meta.canClose!==false];
            ['split-v','split-h'].forEach(act => { let btn = $(bar).find(`[data-act="${act}"]`)[0]; if(btn) { btn.disabled = !canSplit; $(btn).toggleClass('disabled', !canSplit); } });
            let btnC = $(bar).find('[data-act="close"]')[0]; if(btnC) { btnC.disabled = !canClose; $(btnC).toggleClass('disabled', !canClose); }
        };

        let setPaneProps = (paneId, props) => { let meta = paneMeta.get(paneId); if(!meta) return; Object.assign(meta, props);
            if(props.title) { let el = $(containerEl).find(`.viewport-pane[data-id="${paneId}"]`)[0]; if(el) el.dataset.title = props.title; }
            if(typeof props.onUnload === 'function') meta.onUnload = props.onUnload;
            paneMeta.set(paneId, meta); refreshToolbarState(paneId); };
        let getPaneProps = paneId => paneMeta.get(paneId);

        let focusDirection = (dx, dy) => {
            if(!focusedPane) return;
            let panes = Array.from(containerEl.querySelectorAll('.viewport-pane'));
            let cur = focusedPane.el.getBoundingClientRect();
            let candidates = panes.filter(p => p !== focusedPane.el).map(p => {
                let r = p.getBoundingClientRect();
                if(dx) {
                    if(dx > 0 && r.left < cur.right-1 || dx < 0 && r.right > cur.left+1) return null;
                    let overlap = Math.max(0, Math.min(cur.bottom, r.bottom) - Math.max(cur.top, r.top));
                    let primaryDist = dx > 0 ? r.left - cur.right : cur.left - r.right;
                    if(primaryDist < -1) return null;
                    return {el:p, score: primaryDist*1000 + (cur.height - overlap)};
                }
                if(dy > 0 && r.top < cur.bottom-1 || dy < 0 && r.bottom > cur.top+1) return null;
                let overlap = Math.max(0, Math.min(cur.right, r.right) - Math.max(cur.left, r.left));
                let primaryDist = dy > 0 ? r.top - cur.bottom : cur.top - r.bottom;
                if(primaryDist < -1) return null;
                return {el:p, score: primaryDist*1000 + (cur.width - overlap)};
            }).filter(Boolean);
            if(candidates.length) return focusPaneByEl(candidates.sort((a,b) => a.score - b.score)[0].el);
            let [cx, cy] = [cur.left + cur.width/2, cur.top + cur.height/2];
            let fallback = panes.filter(p => p !== focusedPane.el).map(p => {
                let r = p.getBoundingClientRect(); let [px, py] = [r.left + r.width/2, r.top + r.height/2];
                let [vx, vy] = [px-cx, py-cy];
                if(dx && Math.sign(vx) !== Math.sign(dx) || dy && Math.sign(vy) !== Math.sign(dy)) return null;
                return {el:p, score: (dx ? Math.abs(vx) : Math.abs(vy))*2 + (dx ? Math.abs(vy) : Math.abs(vx))};
            }).filter(Boolean);
            if(fallback.length) focusPaneByEl(fallback.sort((a,b) => a.score - b.score)[0].el);
        };

        let injectHelpOverlay = () => {
            if(!options.showHelp) return;
            if(!containerEl.querySelector('.vp-help-overlay')) containerEl.appendChild(Object.assign(document.createElement('div'), {className:'vp-help-overlay', innerHTML:options.hint_text || ``}));
        };

        let getPaneEl = id => findNodeById(rootNode, id)?.el || null;

        let openViewsPopupForPane = (paneId) => {
            let node = findNodeById(rootNode, paneId || focusedPane?.id);
            if(!node || !node.el) return;
            let rect = node.el.getBoundingClientRect();
            let x = Math.max(8, rect.right - 80);
            let y = rect.top + 24;
            let items = options.standardViewList.slice();
            showPopupMenu(x, y, items, { onSelect: it => {
                let view = typeof it === 'string' ? {screen: it} : (it.screen ? it : {screen: it});
                loadView(node.id, view);
            }, container: document.body, emptyText: 'No views available' });
        };

        let loadView = (paneId, view) => {
            let node = findNodeById(rootNode, paneId);
            if(!node || !node.el) return; // nothing to load into
            let meta = paneMeta.get(paneId);
            try { if(meta && typeof meta.onUnload === 'function') meta.onUnload(paneId); if(meta && meta.view && typeof meta.view.onUnload === 'function') meta.view.onUnload(paneId); } catch(e){ console.error('onUnload error', e); }
            if(meta) meta.view = view;
            node.el.innerHTML = `<div style="opacity:.4;">Loading ${view.screen||'...'}...</div>`;
            $(node.el).load(`screens/${view.screen}.html?v=${Date.now()}`, {diff:true, onLoad:()=>$.emit('view:loaded',{paneId,view})});
        };

        let handleKeys = e => { 
            if(!e.altKey || !options.keyboard) return;
            let actions = {
                'KeyV':()=>splitVertical(),'v':()=>splitVertical(),'V':()=>splitVertical(),
                'KeyH':()=>splitHorizontal(),'h':()=>splitHorizontal(),'H':()=>splitHorizontal(),
                'KeyX':()=>closeFocused(),'x':()=>closeFocused(),'X':()=>closeFocused(),
                'KeyO':()=>openViewsPopupForPane(),'o':()=>openViewsPopupForPane(), 'O':()=>openViewsPopupForPane(),
                'ArrowRight':()=>focusDirection(1,0),'ArrowLeft':()=>focusDirection(-1,0),'ArrowUp':()=>focusDirection(0,-1),'ArrowDown':()=>focusDirection(0,1),'Tab':()=>focusNext()
            };
            if(actions[e.code] || actions[e.key]) { 
                (actions[e.code] || actions[e.key])(); 
                e.preventDefault(); 
            } 
        };

        containerEl = typeof container === 'string' ? document.querySelector(container) : container;
        if(!containerEl) throw new Error('TilingViewportManager: container not found');
        if(options.cssVars) Object.keys(options.cssVars).forEach(k => containerEl.style.setProperty(k, options.cssVars[k]));
        buildInitial(); 
        if(options.keyboard) document.addEventListener('keydown', handleKeys);

        this.splitVertical = splitVertical;
        this.splitHorizontal = splitHorizontal;
        this.closeFocused = closeFocused;
        this.focusNext = focusNext;
        this.focusPrev = focusPrev;
        this.serialize = serialize;
        this.restore = restore;
        this.setPaneProps = setPaneProps;
        this.getPaneProps = getPaneProps;
        this.options = options;
        this.loadView = loadView;
        this.getPaneEl = getPaneEl;
        this.getNodeById = getNodeById;
        
        Object.defineProperty(this, 'layout', { get: () => serialize(), set: d => restore(d) });
        Object.defineProperty(this, 'focused', { get: () => focusedPane?.id });
    };

    return TilingViewportManager;
}));