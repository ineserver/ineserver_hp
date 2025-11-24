import { visit } from 'unist-util-visit'
import { Node, Parent } from 'unist'

interface DirectiveNode extends Parent {
    type: 'containerDirective' | 'leafDirective' | 'textDirective'
    name: string
    attributes: Record<string, string>
    data?: {
        hName?: string
        hProperties?: Record<string, unknown>
    }
}

export default function remarkCustomDirectives() {
    return (tree: Node) => {
        visit(tree, (node) => {
            if (
                node.type === 'containerDirective' ||
                node.type === 'leafDirective' ||
                node.type === 'textDirective'
            ) {
                const directiveNode = node as DirectiveNode
                const data = directiveNode.data || (directiveNode.data = {})

                if (directiveNode.name === 'command') {
                    data.hName = 'div'
                    data.hProperties = {
                        className: ['command-code'],
                        ...directiveNode.attributes,
                    }
                }

                if (directiveNode.name === 'details') {
                    data.hName = 'details'
                    data.hProperties = {
                        className: ['collapsible-detail'],
                        ...directiveNode.attributes,
                    }

                    // title属性があればsummaryタグを追加
                    const title = directiveNode.attributes.title
                    if (title) {
                        const summaryNode = {
                            type: 'element',
                            data: {
                                hName: 'summary',
                            },
                            children: [
                                {
                                    type: 'text',
                                    value: title,
                                },
                            ],
                        }
                        // 先頭に追加
                        directiveNode.children.unshift(summaryNode as unknown as Node)
                    }
                }

                // color directive for inline text
                if (directiveNode.name === 'color' && node.type === 'textDirective') {
                    data.hName = 'span'
                    const className = directiveNode.attributes.class || 'text-red'
                    data.hProperties = {
                        className: [className],
                    }
                }
            }
        })
    }
}
