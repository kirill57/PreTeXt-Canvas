(function (global) {
    const templates = [
        {
            id: 'starter-book',
            label: 'Book: Course Starter',
            description: 'Structured for multi-chapter projects with docinfo macros and a ready-made introduction.',
            preview: `<book xml:id="course-book">
    <title>Course Title</title>
    <chapter xml:id="ch-introduction">…</chapter>
</book>`,
            skeleton: `<?xml version="1.0" encoding="UTF-8"?>
<pretext xmlns:xi="http://www.w3.org/2001/XInclude" xml:lang="en-US">
    <docinfo>
        <macros>
        \\newcommand{\\R}{\\mathbb R}
        </macros>
    </docinfo>

    <book xml:id="course-book">
        <title>Course Title</title>

        <chapter xml:id="ch-introduction">
            <title>Introduction</title>

            <section xml:id="sec-overview">
                <title>Overview</title>

                <p>
                    Describe the goals and structure of your course or text here.
                </p>

            </section>

            <section xml:id="sec-first-steps">
                <title>First Steps</title>

                <p>
                    Outline the first topic students should explore.
                </p>

            </section>
        </chapter>
    </book>
</pretext>`
        },
        {
            id: 'concise-article',
            label: 'Article: Concise Overview',
            description: 'A streamlined article with two sections for quick notes or briefs.',
            preview: `<article xml:id="overview-article">
    <section xml:id="sec-introduction">…</section>
    <section xml:id="sec-summary">…</section>
</article>`,
            skeleton: `<?xml version="1.0" encoding="UTF-8"?>
<pretext xmlns:xi="http://www.w3.org/2001/XInclude">
    <article xml:id="overview-article">
        <title>Concise Overview</title>

        <section xml:id="sec-introduction">
            <title>Introduction</title>
            <p>Use this space to introduce the main topic.</p>
            <p>Add supporting remarks with <em>emphasis</em> or inline <c>code</c> as needed.</p>
        </section>

        <section xml:id="sec-summary">
            <title>Summary</title>
            <p>Conclude your short article and reference earlier ideas with <xref ref="sec-introduction"/>.</p>
        </section>
    </article>
</pretext>`
        },
        {
            id: 'math-forward-article',
            label: 'Article: Math Forward',
            description: 'Includes inline and display mathematics plus theorem-style structures.',
            preview: `<article xml:id="math-forward">
    <section xml:id="sec-basic-math">…</section>
    <theorem xml:id="thm-main">…</theorem>
</article>`,
            skeleton: `<?xml version="1.0" encoding="UTF-8"?>
<pretext xmlns:xi="http://www.w3.org/2001/XInclude">
    <article xml:id="math-forward">
        <title>Mathematics Notes</title>

        <section xml:id="sec-basic-math">
            <title>Foundations</title>
            <p>Inline math: <m>x^2 + y^2 = z^2</m> and <m>\\frac{1}{2}</m>.</p>
            <p>Display computation:</p>
            <me>\\int_0^1 x^2 \, dx = \\frac{1}{3}</me>
        </section>

        <section xml:id="sec-theorems">
            <title>Key Results</title>
            <definition xml:id="def-limit">
                <title>Limit</title>
                <statement>
                    <p>The limit of <m>f(x)</m> as <m>x</m> approaches <m>a</m> is <m>L</m> if:</p>
                    <me>\\lim_{x \\to a} f(x) = L</me>
                </statement>
            </definition>
            <theorem xml:id="thm-fundamental">
                <title>Fundamental Theorem of Calculus</title>
                <statement>
                    <p>If <m>f</m> is continuous on <m>[a,b]</m>, then:</p>
                    <me>\\int_a^b f(x) \, dx = F(b) - F(a)</me>
                    <p>where <m>F'(x) = f(x)</m>.</p>
                </statement>
                <proof>
                    <p>Sketch the proof using supporting text or references.</p>
                </proof>
            </theorem>
        </section>
    </article>
</pretext>`
        },
        {
            id: 'activity-handbook',
            label: 'Activity & Exercises',
            description: 'Starter layout for worksheets that combine examples with student tasks.',
            preview: `<article xml:id="activity-handbook">
    <example xml:id="ex-sample">…</example>
    <exercise xml:id="exr-practice">…</exercise>
</article>`,
            skeleton: `<?xml version="1.0" encoding="UTF-8"?>
<pretext xmlns:xi="http://www.w3.org/2001/XInclude">
    <article xml:id="activity-handbook">
        <title>Activity Handbook</title>

        <section xml:id="sec-guided-example">
            <title>Guided Example</title>
            <example xml:id="ex-guided">
                <title>Working Example</title>
                <statement>
                    <p>Present a motivating problem or scenario.</p>
                </statement>
                <solution>
                    <p>Demonstrate the steps students should follow.</p>
                </solution>
            </example>
        </section>

        <section xml:id="sec-practice">
            <title>Practice</title>
            <exercise xml:id="exr-practice">
                <statement>
                    <p>Provide a related task for learners to attempt independently.</p>
                </statement>
                <hint>
                    <p>Offer a gentle hint or remove this element if not needed.</p>
                </hint>
                <solution>
                    <p>Summarize the expected reasoning or final answer.</p>
                </solution>
            </exercise>
        </section>
    </article>
</pretext>`
        }
    ];

    global.PreTeXtTemplates = templates;
})(window);
