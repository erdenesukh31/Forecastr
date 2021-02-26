export const faqData = [
    {
        "question": "<p>1. What does <strong> FTE </strong> mean?</p>",
        "answer": `<ul>
        <li>FTE stands for Full Time Equivalent and is calculated as follows:</li>
        </ul>
        <p><img class="image" src="assets/img/faq/f0.png" /></p>
        <ul>
        <li>
        <p>For example:</p>
        <p>If you work 4 full days per week (32 hours) you are a "Full time equivalent" of 0,8:</p>
        <p>[32/40= 0,8 = 80%]. This means that you should slide the bar to 80.<br /><br /></p>
        <img class="image" src="assets/img/faq/f1.png" /><br /> By doing this, also the number of expected working days on the right side above the comment field will change accordingly</li>
        </ul>`,
    },
    {
        "question": "<p>2. What do <strong>ARVE</strong> and <strong>URVE</strong> mean? How are they calculated?</p>",
        "answer": `<ul>
        <li><strong>ARVE </strong>(Assignment Rate Vacation Excluded): The percentage utilization of an employee on both internal and external projects. Vacation days are deducted beforehand from the possible workdays of the period.</li>
        </ul>
        <img class="image" src="assets/img/faq/f4.png" style="max-width: 50vw;"/>
        <ul>
        <li><strong>URVE </strong>(Utilization Rate Vacation Excluded): The percentage workload of an employee on externally billable projects. Vacation days are deducted beforehand from the possible workdays in the period.</li>
        </ul>
        <img class="image" src="assets/img/faq/f5.png" style="max-width: 50vw;"/>
        <p>&nbsp;</p>
        <ul>
        <li>For example:<br /><br />
        <table style="height: 226px;" width="281">
        <tbody>
        <tr>
        <td style="width: 213px;">
        <p>Expected working days</p>
        </td>
        <td style="width: 52px;">
        <p>20</p>
        </td>
        </tr>
        <tr>
        <td style="width: 213px;">
        <p>Billable project days</p>
        </td>
        <td style="width: 52px;">
        <p>5</p>
        </td>
        </tr>
        <tr>
        <td style="width: 213px;">
        <p>Non-billable project days</p>
        </td>
        <td style="width: 52px;">
        <p>6</p>
        </td>
        </tr>
        <tr>
        <td style="width: 213px;">
        <p>Bench Time</p>
        </td>
        <td style="width: 52px;">
        <p>3</p>
        </td>
        </tr>
        <tr>
        <td style="width: 213px;">
        <p>Business Development Days</p>
        </td>
        <td style="width: 52px;">
        <p>4</p>
        </td>
        </tr>
        <tr>
        <td style="width: 213px;">
        <p>Vacation Days</p>
        </td>
        <td style="width: 52px;">
        <p>2</p>
        </td>
        </tr>
        </tbody>
        </table>
        </li>
        </ul>
        <img class="ff" src="assets/img/faq/f6.png" style="max-width: 50vw;"/>`,
    },
    {
        "question": "<p>3. What does <strong>ARVE/URVE Relevance</strong> mean?</p>",
        "answer": ` <p>If you are a Student Consultant and working on non-billable projects the <strong>ARVE/URVE Relevance</strong> button is automatically disabled. This means that your ARVE and URVE are set to 0. Check question 12 for further explanation.</p>`,
    },
    {
        "question": "<p>4. Why are <strong>Austria Vacation</strong>, <strong>AT_Training CSS</strong> and <strong>Bench Time_non-client_APPS </strong>default projects?</p>",
        "answer": `<p></p>This is been decided by the Development Team.</p>`,
    },
    {
        "question": "<p>5. What is the <strong>forecastr risk probability</strong>?</p>",
        "answer": ` <p><img class="image" src="assets/img/faq/f2.png" /></p><p>It is the chance that a risk will occur.</p>
        <p>Here is an explanation of the three possible risk probabilities.</p>
        <ul>
        <li><strong>Firm</strong>: Firm is used for fixed ("fixed") commitments or tasks. This includes tasks and assignments that have already been confirmed by the customer and discussed with your PDL. For example: official confirmation by signing a contract or approval of leave in DPW.</li>
        <li><strong>Named Likely</strong>: Named Likely is used when there is already a verbal commitment but the project formalities and onboarding are not yet completed. For example: ISOW has not yet been started.</li>
        <li><strong>Unnamed</strong>: Unnamed is used if there are no concrete commitments yet. For example: bench time, training and business development, as well as interview processes are booked under Unnamed.</li>
        </ul>
        <p>&nbsp;</p>
        <p>It is important to select one of the above-mentioned risk probabilities for each forecasted project.</p>`,
    },
    {
        "question": "<p>6. How do I forecast <strong>Austria Vacation </strong>if I am not (exactly) sure when I will be on vacation? Which risk probability do I choose?</p>",
        "answer": `
        <p>If you are not sure when you will be on vacation, you should choose either</p>
        <ul>
        <li><strong>Named Likely</strong>, when you know when it will be, but it hasn&rsquo;t been confirmed yet or</li>
        <li><strong>Unnamed</strong>, when you don&rsquo;t know when or if it will take place at all. (I might take a day off next month, but I am not sure yet.)</li>
        </ul>
       As soon as you have requested the exact vacation days in DPW and they have been approved by your PDL, you can change the risk probability to <strong>Firm</strong>.</strong>
        `,
    },
    {
        "question": "<p>7. How do I forecast <strong>Bench Time_non-client_APPS</strong>? Which risk probability do I choose?</p>",
        "answer": `<p>If you are not involved in a project, you choose either <strong>AT_CSS_billable time interco.</strong> or <strong>AT_CSS_billable time external</strong>
                   <ul>
                   <li><i>First Month</i>: 5 days</li>
                   <li><i>Second Month</i>: 10 days</li>
                   <li><i>Third Month</i>: 15 days</li>
                   <li><i>Other Months</i>: 15 days</li>
                   </ul>
                   The Risk Probability is <strong>Unnamed<strong>.</p>`,
    },
    {
        "question": "<p>8. How do I forecast a project I cannot find?</p>",
        "answer": `<p>There are two projects you can choose in that case:</p>
        <ul>
        <li><strong>AT_CSS_billable time interco. </strong>for projects outside Austria.</li>
        <li><strong>AT_CSS_billable time external </strong>for projects in Austria.</li>
        </ul>
        <p>The project names may seem a bit confusing. Check question 10 for further explanation.</p>`,
    },
    {
        "question": "<p>9. How do I forecast a project when I don&rsquo;t know the exact number of days I will be working on this project?</p>",
        "answer": `<p><img class="image" src="assets/img/faq/f3.png" style="max-width: 50vw;"/></p><p>If the days you work on a project vary each month depending on the workload, you can fill-in the number of fixed project days, mark if a project is billable or not, and choose the forecast probability <strong>Firm. </strong>After this, try to estimate the varying project days, mark if a project is billable or not and choose the forecast probability <strong>Named Likely </strong>as shown in the screenshot below.</p>`,
    },
    {
        "question": "<p>10. What is the difference between <strong>internal </strong>and<strong> external revenue</strong>?</p>",
        "answer": `<ul>
        <li><strong>External revenue</strong>: Sales generated with projects <strong>in</strong> Austria.</li>
        <li><strong>Internal revenue</strong>: Sales generated with projects <strong>outside</strong> Austria.</li>
        </ul>`,
    },
    {
        "question": "<p>11. What is the difference between <strong>billable </strong>and<strong> non-billable projects</strong>?</p>",
        "answer": `<p>All externally chargeable project days. If days are booked on a customer project, but the customer does not pay for it (e.g.: overrun for fixed price project or training), they do not count as billable project days.</p>`,
    },
    {
        "question": "<p>12. Why does (sometimes) the number of <strong>Bench Time non-client APPS change</strong> after saving my forecast?</p>",
        "answer": `<p>If you forecasted less than expected working days, the system automatically adds the remaining days to the <strong>Bench Time non-client APPS change.</strong></p>`,
    },
    {
        "question": "<p>13. How do I forecast <strong>Team Meetings</strong>?</p>",
        "answer": `<p>Team Meetings are counted to the default project 100528772 - Bench Time_non-client_APPS.</p>
        <p>As the forecast is done on a daily basis, you can use the following formula:</p>
        <img class="ff" src="assets/img/faq/f7.png" style="max-width: 50vw;"/>
        <p>Use a decimal dot instead of a comma.</p>`,
    },
    {
        "question": "<p>14. How do I forecast <strong>sickness and educational absence</strong>?</p>",
        "answer" : "<p>Sickness and educational absence should be forecasted as Bench Time_non_client_APPS.</p>"
    }
]