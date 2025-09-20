/**
 * ===================================================================
 * SF Highlighter (Gemini Style)
 * ===================================================================
 *
 * @file       assets/js/sf-highlighter-gemini.js
 * @package    sf-lecture-one
 * @version    1.2.1
 */

class SF_Highlighter_Gemini {
  constructor() {
    this.languageMap = {
      javascript: "javascript",
      js: "javascript",
      mjs: "javascript",
      cjs: "javascript",
      typescript: "typescript",
      ts: "typescript",
      jsx: "jsx",
      tsx: "tsx",
      html: "markup",
      htm: "markup",
      xml: "markup",
      svg: "markup",
      rss: "markup",
      atom: "markup",
      css: "css",
      scss: "scss",
      less: "scss",
      php: "php",
      python: "python",
      py: "python",
      java: "java",
      csharp: "csharp",
      cs: "csharp",
      ruby: "ruby",
      rb: "ruby",
      go: "go",
      golang: "go",
      rust: "rust",
      rs: "rust",
      kotlin: "kotlin",
      kt: "kotlin",
      kts: "kotlin",
      swift: "swift",
      c: "c",
      h: "c",
      cpp: "cpp",
      "c++": "cpp",
      cc: "cpp",
      hpp: "cpp",
      bash: "bash",
      shell: "bash",
      sh: "bash",
      powershell: "powershell",
      ps1: "powershell",
      sql: "sql",
      graphql: "graphql",
      r: "r",
      json: "json",
      webmanifest: "json",
      yaml: "yaml",
      yml: "yaml",
      docker: "docker",
      dockerfile: "docker",
      nginx: "nginx",
      markdown: "markdown",
      md: "markdown",
      perl: "perl",
      pl: "perl",
      lua: "lua",
      dart: "dart",
      scala: "scala",
    };

    // [핵심 수정] 1. 상속의 기반이 될 핵심 문법 규칙들을 먼저 상수로 정의합니다.
    const baseGrammar = {
      comment: /#.*|\/\/.*|\/\*[\s\S]*?\*\//,
      string: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`/,
      className: /\b[A-Z][\w]*/,
      function: /\b[a-zA-Z_]\w*(?=\s*\()/i,
      number: /\b-?(?:0x[\da-f]+|\d*\.?\d+(?:e[+-]?\d+)?)\b/i,
      boolean: /\b(?:true|false|null|nil|None)\b/,
      operator: /=>|->|--|\+\+|&&|\|\||!=|!==|==|===|<=|>=|<|>|[+\-*/%&|^~!?=]/,
      punctuation: /[{}[\]();,.:]/,
    };

    const javaGrammar = {
      ...baseGrammar,
      keyword:
        /\b(?:if|else|for|while|return|class|const|new|this|try|catch|finally|do|switch|case|break|continue|public|private|protected|implements|interface|extends|enum|super|true|false|null|import|package|void|static|final|abstract|synchronized|throws|throw|instanceof)\b/,
    };

    // [핵심 수정] 2. this.grammar 객체를 정의할 때, 미리 만들어둔 상수를 사용하여 조합합니다.
    this.grammar = {
      javascript: {
        ...baseGrammar,
        keyword:
          /\b(?:if|else|for|while|return|function|class|const|let|var|import|export|from|new|this|try|catch|finally|do|switch|case|break|continue|delete|typeof|instanceof|in|of|yield|await|async|static|get|set|public|private|protected|implements|interface|extends|enum|super)\b/,
      },
      typescript: {
        ...baseGrammar,
        keyword:
          /\b(?:if|else|for|while|return|function|class|const|let|var|import|export|from|new|this|try|catch|finally|do|switch|case|break|continue|delete|typeof|instanceof|in|of|yield|await|async|static|get|set|public|private|protected|implements|interface|extends|enum|super|type|readonly|declare|abstract|is|keyof|never|unknown|any)\b/,
      },
      markup: {
        comment: /<!--[\s\S]*?-->/,
        tag: {
          pattern: /<\/?[\w\s="/.':#-]+>/,
          inside: {
            "attr-name": /[\w-]+(?=\s*=)/,
            "attr-value": /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/,
            punctuation: /[<>=\/]/,
          },
        },
        entity: /&[\da-z]{1,8};/i,
      },
      css: {
        comment: /\/\*[\s\S]*?\*\//,
        string: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/,
        property: /\b[\w-]+(?=\s*:)/,
        keyword:
          /@(?:media|import|charset|namespace|font-face|keyframes|supports)/,
        function: /\b(?:rgb|rgba|hsl|hsla|url|attr|calc|var)\b/,
        punctuation: /[{}();:,]/,
        className: /\.[a-zA-Z_][\w-]*/,
      },
      scss: {
        ...baseGrammar,
        comment: /\/\/.*|\/\*[\s\S]*?\*\//,
        property: /\$[\w-]+/,
        keyword:
          /@(?:if|else|for|while|each|import|mixin|include|extend|function|return|debug|warn|error)\b/,
      },
      php: {
        ...baseGrammar,
        comment: /#.*|\/\/.*|\/\*[\s\S]*?\*\//,
        keyword:
          /\b(?:if|else|for|while|return|function|class|const|echo|new|this|try|catch|finally|do|switch|case|break|continue|die|exit|isset|unset|include|require|array|public|private|protected|implements|interface|extends|enum|super|true|false|null|__halt_compiler|abstract|and|as|callable|clone|declare|default|enddeclare|endfor|endforeach|endif|endswitch|endwhile|final|fn|foreach|global|goto|instanceof|insteadof|namespace|or|parent|static|trait|use|var|xor|yield|from)\b/,
        property: /\$[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/,
      },
      python: {
        ...baseGrammar,
        comment: /#.*/,
        keyword:
          /\b(?:if|else|for|while|return|def|class|import|from|new|self|try|except|finally|do|break|continue|del|in|is|lambda|not|or|and|pass|raise|with|yield|async|await|True|False|None)\b/,
        decorator: /@\w+/,
      },
      java: javaGrammar, // 미리 정의된 javaGrammar 사용
      csharp: {
        ...baseGrammar,
        keyword:
          /\b(?:if|else|for|while|return|class|const|new|this|try|catch|finally|do|switch|case|break|continue|public|private|protected|implements|interface|extends|enum|base|true|false|null|using|namespace|void|static|sealed|abstract|override|virtual|async|await|get|set|in|is|as|params|ref|out)\b/,
      },
      ruby: {
        ...baseGrammar,
        comment: /#.*/,
        keyword:
          /\b(?:if|else|for|while|return|def|class|module|new|self|case|when|begin|rescue|ensure|break|next|redo|retry|in|yield|super|true|false|nil|and|or|not|alias|undef)\b/,
        property: /[:@$]\w+/,
      },
      go: {
        ...baseGrammar,
        keyword:
          /\b(?:if|else|for|range|return|func|struct|const|var|import|package|new|switch|case|break|continue|defer|go|goto|interface|map|select|type|fallthrough)\b/,
      },
      rust: {
        ...baseGrammar,
        keyword:
          /\b(?:if|else|for|while|return|fn|struct|let|const|mut|match|loop|break|continue|in|use|mod|pub|enum|impl|trait|where|self|Self|super|true|false|async|await|static|move)\b/,
      },
      kotlin: {
        ...javaGrammar,
        keyword:
          /\b(?:if|else|for|while|return|fun|class|val|var|when|is|in|object|package|import|this|super|true|false|null|try|catch|finally|break|continue|do|throw|interface|enum|data|sealed|companion|override|open|internal|private|protected|public|abstract|final)\b/,
      },
      swift: {
        ...baseGrammar,
        keyword:
          /\b(?:Any|Protocol|Self|Type|actor|as|assignment|associatedtype|associativity|async|await|break|case|catch|class|continue|convenience|default|defer|deinit|didSet|do|dynamic|else|enum|extension|fallthrough|fileprivate|final|for|func|get|guard|higherThan|if|import|in|indirect|infix|init|inout|internal|is|isolated|lazy|left|let|lowerThan|mutating|none|nonisolated|nonmutating|open|operator|optional|override|postfix|precedencegroup|prefix|private|protocol|public|repeat|required|rethrows|return|right|safe|self|set|some|static|struct|subscript|super|switch|throw|throws|try|typealias|unowned|unsafe|var|weak|where|while|willSet)\b/,
      },
      c: {
        ...baseGrammar,
        keyword:
          /\b(?:if|else|for|while|return|struct|const|void|int|char|float|double|long|short|unsigned|signed|sizeof|typedef|enum|static|auto|extern|register|goto|switch|case|break|continue|default|union|volatile)\b/,
      },
      cpp: {
        ...baseGrammar,
        keyword:
          /\b(?:if|else|for|while|return|struct|const|void|int|char|float|double|long|short|unsigned|signed|sizeof|typedef|enum|static|auto|extern|register|goto|switch|case|break|continue|default|union|volatile|class|new|this|try|catch|throw|public|private|protected|friend|virtual|inline|namespace|using|template|typename|true|false|nullptr|delete|explicit|export|mutable|operator|reinterpret_cast|static_cast|const_cast|dynamic_cast|typeid)\b/,
      },
      bash: {
        comment: /#.*/,
        string: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/,
        keyword:
          /\b(?:if|then|else|elif|fi|for|in|do|done|while|until|case|esac|function|select|time|coproc)\b/,
        property: /\$\w+|\$\{[^}]+\}/,
        function:
          /\b(?:alias|bg|bind|break|builtin|caller|cd|command|compgen|complete|compopt|continue|declare|dirs|disown|echo|enable|eval|exec|exit|export|false|fc|fg|getopts|hash|help|history|jobs|kill|let|local|logout|mapfile|popd|printf|pushd|pwd|read|readonly|return|set|shift|shopt|source|suspend|test|times|trap|true|type|typeset|ulimit|umask|unalias|unset|wait)\b/,
      },
      powershell: {
        comment: /#.*|<#[\s\S]*?#>/,
        string: /"(?:``|[^"])*"|'(?:''|[^'])*'/,
        keyword:
          /\b(?:if|else|elseif|for|foreach|while|do|until|switch|break|continue|return|function|filter|try|catch|finally|throw|trap|param|begin|process|end|class|enum|using|namespace)\b/,
        property: /\$\w+/,
      },
      sql: {
        comment: /--.*|\/\*[\s\S]*?\*\//,
        string: /'(?:''|[^'])*'/,
        keyword:
          /\b(?:SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|VIEW|INDEX|ALTER|DROP|TRUNCATE|AS|JOIN|INNER|LEFT|RIGHT|OUTER|ON|GROUP|BY|ORDER|HAVING|LIMIT|OFFSET|CASE|WHEN|THEN|ELSE|END|AND|OR|NOT|IN|IS|NULL|LIKE|BETWEEN|EXISTS|DISTINCT|COUNT|SUM|AVG|MAX|MIN|UNION|ALL)\b/i,
        number: /\b\d+(?:\.\d+)?\b/,
        operator: /[<>]=?|!=|=|[+\-*/%]/,
      },
      json: {
        property: /"(?:\\.|[^"\\])*"(?=\s*:)/,
        string: /"(?:\\.|[^"\\])*"/,
        number: /\b-?\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i,
        boolean: /\b(?:true|false|null)\b/,
        punctuation: /[{}[\]:,]/,
      },
      yaml: {
        comment: /#.*/,
        string: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/,
        keyword: /^(?:true|false|null|on|off|yes|no)$/i,
        property: /[\w-]+(?=:)/,
        punctuation: /[:{}\[\]\-,|&*>!]/,
      },
      docker: {
        comment: /#.*/,
        keyword:
          /\b(?:FROM|RUN|CMD|LABEL|EXPOSE|ENV|ADD|COPY|ENTRYPOINT|VOLUME|USER|WORKDIR|ARG|ONBUILD|STOPSIGNAL|HEALTHCHECK|SHELL)\b/i,
        string: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/,
      },
      // ... 다른 언어 규칙들도 여기에 추가 ...
    };

    this.highlightAll();
  }

  // ... (tokenize, stringify, highlightAll, highlightElement 및 나머지 함수는 변경 없음) ...
  tokenize(text, grammar) {
    const tokens = [];
    let lastIndex = 0;
    const regexParts = [];
    for (const tokenName in grammar) {
      const pattern =
        grammar[tokenName] instanceof RegExp
          ? grammar[tokenName].source
          : grammar[tokenName].pattern;
      regexParts.push(`(?<${tokenName}>${pattern})`);
    }
    const combinedRegex = new RegExp(regexParts.join("|"), "g");
    text.replace(combinedRegex, (match, ...args) => {
      const groups = args.pop();
      const matchIndex = args[args.length - 2];
      if (matchIndex > lastIndex) {
        tokens.push(text.slice(lastIndex, matchIndex));
      }
      for (const tokenName in groups) {
        if (groups[tokenName] !== undefined) {
          tokens.push({ type: tokenName, content: groups[tokenName] });
          break;
        }
      }
      lastIndex = matchIndex + match.length;
    });
    if (lastIndex < text.length) {
      tokens.push(text.slice(lastIndex));
    }
    return tokens;
  }

  stringify(tokens) {
    return tokens
      .map((token) => {
        if (typeof token === "string") {
          return this.escapeHtml(token);
        }
        const escapedContent = this.escapeHtml(token.content);
        return `<span class="token ${token.type}">${escapedContent}</span>`;
      })
      .join("");
  }

  highlightAll() {
    const blocks = document.querySelectorAll(
      'pre > code[class*="language-"], pre > code[class*="lang-"]'
    );
    blocks.forEach((block) => this.highlightElement(block));
  }

  highlightElement(block) {
    const pre = block.parentElement;
    const languageAlias = this.getLanguageAlias(block);
    const languageKey = this.languageMap[languageAlias] || languageAlias;
    const languageGrammar =
      this.grammar[languageKey] || this.grammar["javascript"];
    const code = block.textContent;
    const tokens = this.tokenize(code, languageGrammar);
    const highlightedCode = this.stringify(tokens);
    const container = document.createElement("div");
    container.className = "sf-highlighter-gemini-container";
    container.innerHTML = `
            <div class="sf-hg-header">
                <div class="sf-hg-info">
                    <span class="sf-hg-icon material-symbols-outlined" aria-hidden="true">code</span>
                    <span class="sf-hg-language">${languageAlias.toUpperCase()}</span>
                </div>
                <div class="sf-hg-controls">
                    <button class="sf-hg-button sf-hg-btn-copy" aria-label="Copy code">
                        <span class="material-symbols-outlined" aria-hidden="true">content_copy</span>
                    </button>
                    <button class="sf-hg-button sf-hg-btn-toggle" aria-label="Toggle code block">
                        <span class="material-symbols-outlined" aria-hidden="true">expand_less</span>
                    </button>
                </div>
            </div>
            <pre class="sf-hg-codeblock"><code class="language-${languageAlias}">${highlightedCode}</code></pre>
        `;
    pre.parentNode.replaceChild(container, pre);
    this.addEventListeners(container);
  }

  getLanguageAlias(block) {
    for (let className of block.classList) {
      if (className.startsWith("language-") || className.startsWith("lang-")) {
        return className
          .replace("language-", "")
          .replace("lang-", "")
          .toLowerCase();
      }
    }
    return "text";
  }

  addEventListeners(container) {
    const copyBtn = container.querySelector(".sf-hg-btn-copy");
    const toggleBtn = container.querySelector(".sf-hg-btn-toggle");
    const codeBlock = container.querySelector(".sf-hg-codeblock");
    toggleBtn.addEventListener("click", () => {
      codeBlock.classList.toggle("collapsed");
      toggleBtn.classList.toggle("collapsed");
    });
    copyBtn.addEventListener("click", () => {
      const code = codeBlock.textContent;
      navigator.clipboard.writeText(code).then(() => {
        copyBtn.classList.add("copied");
        setTimeout(() => copyBtn.classList.remove("copied"), 2000);
      });
    });
  }

  escapeHtml(str) {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return str.replace(/[&<>"']/g, (match) => map[match]);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new SF_Highlighter_Gemini();
});
