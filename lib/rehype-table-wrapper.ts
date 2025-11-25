import { visit } from 'unist-util-visit'
import { Node, Parent } from 'unist'

interface ElementNode extends Parent {
    type: 'element'
    tagName: string
    properties?: Record<string, unknown>
    children: Node[]
}

/**
 * テーブルをdivでラップするrehypeプラグイン
 * モバイルでのスクロールを可能にします
 */
export default function rehypeTableWrapper() {
    return (tree: Node) => {
        visit(tree, 'element', (node: Node, index: number | undefined, parent: Parent | undefined) => {
            const elementNode = node as ElementNode
            
            if (elementNode.tagName === 'table' && parent && typeof index === 'number') {
                // テーブルをdivでラップ
                const wrapper: ElementNode = {
                    type: 'element',
                    tagName: 'div',
                    properties: {
                        className: ['table-wrapper']
                    },
                    children: [elementNode]
                }
                
                // 親ノードの子配列でテーブルをラッパーに置き換え
                parent.children[index] = wrapper
            }
        })
    }
}
