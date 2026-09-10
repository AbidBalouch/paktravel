"use client";
// components/LocationTreeSelect/LocationTreeSelect.jsx
// ---------------------------------------------------------------------------
// Searchable, hierarchical (Province -> Division -> District) radio-select
// tree for the Destinations taxonomy. Only ONE term can be selected at a
// time (radio behavior), and a breadcrumb shows the full ancestry path of
// whatever is selected.
// ---------------------------------------------------------------------------

import { useMemo, useState } from "react";
import styles from "./LocationTreeSelect.module.css";

/** Flat [{id, name, parent}] -> nested tree [{id, name, children: [...]}] */
function buildTree(terms) {
    const byId = new Map(terms.map((t) => [t.id, { ...t, children: [] }]));
    const roots = [];

    byId.forEach((node) => {
        if (node.parent && byId.has(node.parent)) {
            byId.get(node.parent).children.push(node);
        } else {
            roots.push(node);
        }
    });

    const sortByName = (nodes) => {
        nodes.sort((a, b) => a.name.localeCompare(b.name));
        nodes.forEach((n) => sortByName(n.children));
    };
    sortByName(roots);

    return roots;
}

/** Search ke waqt: node visible hai agar khud match kare, ya koi descendant match kare */
function nodeMatchesSearch(node, query) {
    if (node.name.toLowerCase().includes(query)) return true;
    return node.children.some((child) => nodeMatchesSearch(child, query));
}

function TreeNode({ node, depth, selectedId, onSelect, searchQuery, forceExpand }) {
    const [manuallyExpanded, setManuallyExpanded] = useState(false);
    const hasChildren = node.children.length > 0;

    if (searchQuery && !nodeMatchesSearch(node, searchQuery)) {
        return null; // search se match nahi hua, na khud na descendants
    }

    // Search active ho to matching branches auto-expand rahen; warna manual toggle
    const isExpanded = searchQuery ? true : manuallyExpanded || forceExpand;

    return (
        <div className={styles.node} style={{ paddingLeft: depth * 20 }}>
            <div className={styles.nodeRow}>
                {hasChildren ? (
                    <button
                        type="button"
                        className={styles.toggle}
                        onClick={() => setManuallyExpanded((v) => !v)}
                        aria-label={isExpanded ? "Collapse" : "Expand"}
                    >
                        {isExpanded ? "−" : "+"}
                    </button>
                ) : (
                    <span className={styles.toggleSpacer} />
                )}

                <label className={styles.radioLabel}>
                    <input
                        type="radio"
                        name="destination-term"
                        checked={selectedId === node.id}
                        onChange={() => onSelect(node.id)}
                    />
                    <span>{node.name}</span>
                </label>
            </div>

            {hasChildren && isExpanded && (
                <div>
                    {node.children.map((child) => (
                        <TreeNode
                            key={child.id}
                            node={child}
                            depth={depth + 1}
                            selectedId={selectedId}
                            onSelect={onSelect}
                            searchQuery={searchQuery}
                            forceExpand={forceExpand}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function LocationTreeSelect({ terms, value, onChange }) {
    const [search, setSearch] = useState("");

    const tree = useMemo(() => buildTree(terms), [terms]);
    const byId = useMemo(() => new Map(terms.map((t) => [t.id, t])), [terms]);

    // Selected term se upar tak walk kar ke breadcrumb path banate hain
    const breadcrumb = useMemo(() => {
        if (value == null) return [];
        const path = [];
        let current = byId.get(value);
        while (current) {
            path.unshift(current.name);
            current = current.parent ? byId.get(current.parent) : null;
        }
        return path;
    }, [value, byId]);

    const query = search.trim().toLowerCase();

    return (
        <div className={styles.wrapper}>
            <input
                type="text"
                placeholder="Search province, division, or district..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
            />

            {breadcrumb.length > 0 && (
                <p className={styles.breadcrumb}>
                    Selected: <strong>{breadcrumb.join(" → ")}</strong>
                </p>
            )}

            <div className={styles.tree}>
                {tree.map((rootNode) => (
                    <TreeNode
                        key={rootNode.id}
                        node={rootNode}
                        depth={0}
                        selectedId={value}
                        onSelect={onChange}
                        searchQuery={query}
                        forceExpand={false}
                    />
                ))}
            </div>
        </div>
    );
}