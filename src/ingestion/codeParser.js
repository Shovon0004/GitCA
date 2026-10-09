const {
    parseJavaScript
} = require("./treeSitter");


function extractCodeEntities(code) {

    const tree = parseJavaScript(code);

    const root = tree.rootNode;

    const functions = [];
    const classes = [];
    const imports = [];
    const calls = [];


    function walk(node, currentFunction = null) {

        // Function declaration
        if (
            node.type === "function_declaration"
        ) {

            const nameNode =
                node.childForFieldName("name");

            if (nameNode) {

                const functionName =
                    nameNode.text;

                functions.push({
                    name: functionName,
                    type: "function",
                    startLine:
                        node.startPosition.row + 1,
                    endLine:
                        node.endPosition.row + 1
                });

                for (
                    const child
                    of node.namedChildren
                ) {

                    walk(
                        child,
                        functionName
                    );
                }

                return;
            }
        }


        // Class declaration
        if (
            node.type === "class_declaration"
        ) {

            const nameNode =
                node.childForFieldName("name");

            if (nameNode) {

                const className =
                    nameNode.text;

                classes.push({
                    name: className,
                    type: "class",
                    startLine:
                        node.startPosition.row + 1,
                    endLine:
                        node.endPosition.row + 1
                });

                for (
                    const child
                    of node.namedChildren
                ) {

                    walk(
                        child,
                        currentFunction
                    );
                }

                return;
            }
        }


        // Class method
        if (
            node.type === "method_definition"
        ) {

            const nameNode =
                node.childForFieldName("name");

            if (nameNode) {

                const functionName =
                    nameNode.text;

                functions.push({
                    name: functionName,
                    type: "method",
                    startLine:
                        node.startPosition.row + 1,
                    endLine:
                        node.endPosition.row + 1
                });

                for (
                    const child
                    of node.namedChildren
                ) {

                    walk(
                        child,
                        functionName
                    );
                }

                return;
            }
        }


        // ES Module import
        if (
            node.type === "import_statement"
        ) {

            const sourceNode =
                node.childForFieldName("source");

            if (sourceNode) {

                imports.push(
                    sourceNode.text.replace(
                        /["']/g,
                        ""
                    )
                );
            }
        }


        // CommonJS require()
        if (
            node.type === "call_expression"
        ) {

            const functionNode =
                node.childForFieldName(
                    "function"
                );

            if (
                functionNode &&
                functionNode.text === "require"
            ) {

                const argumentsNode =
                    node.childForFieldName(
                        "arguments"
                    );

                if (argumentsNode) {

                    const sourceNode =
                        argumentsNode.namedChildren[0];

                    if (sourceNode) {

                        imports.push(
                            sourceNode.text.replace(
                                /["']/g,
                                ""
                            )
                        );
                    }
                }
            }
        }


        // Function calls
        if (
            node.type === "call_expression"
        ) {

            const functionNode =
                node.childForFieldName(
                    "function"
                );

            if (
                functionNode &&
                functionNode.text !== "require" &&
                currentFunction
            ) {

                calls.push({
                    caller: currentFunction,
                    callee: functionNode.text
                });
            }
        }


        // Traverse children
        for (
            const child
            of node.namedChildren
        ) {

            walk(
                child,
                currentFunction
            );
        }
    }


    walk(root);


    return {
        functions,
        classes,
        imports,
        calls
    };
}


module.exports = {
    extractCodeEntities
};