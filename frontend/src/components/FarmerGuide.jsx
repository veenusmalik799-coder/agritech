const sections = [
  {
    title: "Start with your soil",
    intro: "A soil test helps you choose the right crop and avoid spending on nutrients your field already has.",
    points: [
      ["Collect a useful sample", "Take small samples from several spots in one field, at a consistent depth. Mix them in a clean bucket and send the composite sample to a soil testing laboratory. Keep separate fields or visibly different areas separate."],
      ["Avoid unusual spots", "Skip areas near field edges, manure heaps, old fertilizer piles, water troughs or burnt patches. These can give misleading results that don't represent the field."],
      ["Understand pH", "Soil pH affects how easily roots can access nutrients. Ask your local agricultural extension office or soil lab how to correct pH for your crop and soil type; lime and other amendments should follow test guidance."],
      ["Retest over time", "Keep each field's test results and fertilizer records. Retest at the interval recommended by your local soil lab, and after major changes to the field."],
    ],
  },
  {
    title: "What the main nutrients do",
    intro: "N, P and K are the primary nutrients shown in a basic soil test. Plants also need secondary nutrients and trace elements.",
    points: [
      ["Nitrogen (N)", "Supports leafy growth and chlorophyll. Too much can cause weak, lush growth, delay maturity, or wash into water. Split applications are often useful, depending on crop and local recommendations."],
      ["Phosphorus (P)", "Helps roots establish and supports energy transfer and flowering. It moves slowly in soil, so place and apply it according to the crop recommendation and test."],
      ["Potassium (K)", "Supports water regulation, crop strength and produce quality. Crop removal and soil type matter when deciding how much to replace."],
      ["Secondary and trace nutrients", "Calcium, magnesium and sulfur, and trace elements such as zinc, iron and boron, matter too. A basic N-P-K test won't show them, so ask your lab about extended tests if crops show unexplained yellowing, stunting or poor grain or fruit set."],
    ],
  },
  {
    title: "Choose crops for your field",
    intro: "Match the crop to local growing conditions, water availability, soil and the time of year. A prediction is a starting point; local advice and market access matter too.",
    points: [
      ["Check the season and water", "Confirm planting dates, expected rainfall, irrigation supply and drainage with your local agriculture office. Avoid a crop whose water needs your field cannot meet."],
      ["Rotate where practical", "Alternating crop families can help manage pests and diseases and make better use of nutrients. Legumes can contribute nitrogen, but their benefit depends on the species, growth and residue management."],
      ["Use locally adapted varieties", "Ask extension workers or trusted local seed suppliers about varieties suited to your area, planting window and intended market."],
      ["Think about the market", "A good agronomic fit still needs a buyer. Check nearby prices, transport costs, storage options and demand before committing a whole field to one crop."],
    ],
  },
  {
    title: "Use fertilizer carefully",
    intro: "There is no single safe fertilizer dose for every farm. Rates depend on the crop, soil test, yield goal, fertilizer label and local conditions.",
    points: [
      ["Follow a recommendation", "Use the soil test and a crop-specific recommendation from your local agricultural extension service. Check whether the recommendation is expressed as nutrient (N–P₂O₅–K₂O) or as a fertilizer product."],
      ["Read the label", "The three numbers on a fertilizer bag show its nutrient analysis. Calculate product quantity from the recommended nutrient rate, and use a scale or calibrated spreader for even application."],
      ["Time it with the crop", "Nutrients are used most when the crop is actively growing. Applying in stages, close to when the crop needs it, usually wastes less than one large early application."],
      ["Keep nutrients out of waterways", "Do not apply immediately before heavy rain or onto saturated ground. Keep fertilizer away from wells, drains and waterways, and store it dry and secure."],
      ["Protect yourself", "Wear the protective equipment stated on the label, avoid inhaling dust, wash after handling, and keep fertilizer away from children, animals, seed and food."],
    ],
  },
  {
    title: "Manage water wisely",
    intro: "Water often limits yield more than nutrients do. Getting it right protects both your crop and your soil.",
    points: [
      ["Know your crop's critical stages", "Most crops are most sensitive to water stress around germination, flowering and grain or fruit filling. If water is limited, prioritise these stages."],
      ["Check before you irrigate", "Dig a small hole and feel the soil at root depth. Watering on a fixed schedule regardless of weather or soil moisture wastes water and can leach nutrients."],
      ["Improve drainage where needed", "Waterlogged soil starves roots of oxygen and encourages disease. Raised beds, ridges or drainage channels can help in heavy or flat fields."],
      ["Conserve moisture", "Mulch, crop residue cover and reduced tillage can slow evaporation and protect the surface from heavy rain."],
    ],
  },
  {
    title: "Build long-term soil health",
    intro: "Healthy soil holds water and nutrients better and is less dependent on purchased inputs over time.",
    points: [
      ["Add organic matter", "Compost, well-rotted manure and returned crop residues improve structure and water holding. Manure and compost also contain nutrients, so factor them into your fertilizer plan."],
      ["Use cover crops or green manure", "Growing a cover crop between main crops can reduce erosion, suppress weeds and add organic matter. Choose species suited to your season and water."],
      ["Limit erosion", "Plant across the slope rather than down it, keep the soil covered, and use bunds, strips or terraces on sloping land."],
      ["Avoid compaction", "Heavy machinery and working very wet soil squeeze out air and water pathways. Wait until soil is workable, and avoid repeated passes on the same track."],
    ],
  },
  {
    title: "Pests, weeds and diseases",
    intro: "Prevention and early detection are cheaper and safer than heavy spraying. Combine several methods rather than relying on one.",
    points: [
      ["Scout regularly", "Walk the field every week or so and check the undersides of leaves, stems and the field edges. Catching a problem early often means a smaller, cheaper response."],
      ["Prevent first", "Use clean seed, resistant varieties, crop rotation and good spacing. Remove infected plant material and clean tools when moving between fields."],
      ["Control weeds early", "Weeds compete most with young crops. Timely hand weeding, hoeing or mulching in the first weeks can protect yield."],
      ["Use pesticides responsibly", "Identify the problem first, then ask your extension office which product, if any, is approved for your crop. Follow the label for dose, timing, protective gear and the waiting period before harvest. Never reuse empty containers for food or water."],
    ],
  },
  {
    title: "Harvest, storage and records",
    intro: "Good practice after planting protects what you've grown and helps you improve next season.",
    points: [
      ["Harvest at the right stage", "Harvest when the crop is mature and, for grain and pulses, dry enough to store. Harvesting too early or too wet raises losses and spoilage."],
      ["Store dry and clean", "Dry produce properly, use clean containers or stores, and protect against moisture, rodents and insects. Check stored produce regularly."],
      ["Keep simple records", "Note the field, crop and variety, planting and harvest dates, inputs used with amounts and costs, and yield. After a few seasons these records show what really pays."],
      ["Compare against the prediction", "If you followed a recommendation, note how the crop actually performed. This helps you judge how well the advice suits your field."],
    ],
  },
];

const checklist = [
  "Soil sample taken and sent to a lab, with results in hand",
  "Crop chosen with local advice, water supply and market in mind",
  "Fertilizer rate confirmed with an extension officer or agronomist",
  "Seed or planting material from a trusted source",
  "Irrigation or rainfall plan for the critical growth stages",
  "Protective equipment and safe storage for fertilizer and chemicals",
  "Notebook or app ready for field records",
];

const glossary = [
  ["N, P, K", "Nitrogen, phosphorus and potassium, the three primary plant nutrients."],
  ["pH", "A 0–14 scale of soil acidity. Below 7 is acidic, above 7 is alkaline."],
  ["kg/ha", "Kilograms per hectare, a common unit for nutrient levels or application rates."],
  ["Composite sample", "Several small samples from one field mixed together to represent it."],
  ["Organic matter", "Decomposed plant and animal material that improves soil structure and holds nutrients."],
  ["Leaching", "Nutrients washing down through the soil with water, out of reach of roots."],
  ["Crop rotation", "Growing different crops in sequence on the same field."],
  ["Green manure", "A crop grown mainly to be turned into the soil to add nutrients and organic matter."],
];

const faqs = [
  ["How often should I test my soil?", "Many labs suggest every two to three years, and again after major changes such as liming, a new crop system or heavy erosion. Your local soil lab or extension office can give a recommendation for your region."],
  ["Is the app's crop recommendation enough to decide on its own?", "Treat it as a starting point. It uses your soil and weather values, but it can't see your local market, pest pressure, water access or planting calendar. Check it against local advice before committing."],
  ["Can I use organic fertilizer instead?", "Yes. Compost and manure supply nutrients and improve soil structure, but their nutrient content varies a lot. Ask your lab or extension officer how to account for them in your plan."],
  ["My soil test shows high nutrients. Should I still fertilize?", "Not necessarily. If a nutrient is already high, adding more can waste money and harm the environment. Follow the recommendation for your crop."],
  ["What if my pH is off?", "Don't guess. Corrective amendments depend on your soil type, crop and how far off the pH is, so get specific advice from a soil lab or extension officer."],
];

export default function FarmerGuide() {
  return (
    <main className="space-y-6">
      <section className="rounded-xl bg-field p-6 text-paper shadow-sm sm:p-8">
        <p className="text-sm font-bold uppercase tracking-wide text-wheat">Practical field notes</p>
        <h2 className="mt-2 text-3xl font-bold sm:text-4xl">A farmer’s guide to soil, crops & fertilizer</h2>
        <p className="mt-3 max-w-3xl leading-relaxed text-paper/80">
          Use these basics to make informed decisions. Soil and fertilizer needs vary by field and region, so use a current soil test and local crop advice before choosing application rates.
        </p>
      </section>

      <section className="rounded-xl bg-sage p-5 ring-1 ring-field/10 sm:p-6">
        <h3 className="text-xl font-bold text-field">How to use your recommendation</h3>
        <ol className="mt-3 grid gap-3 text-sm leading-relaxed text-soil/80 sm:grid-cols-3">
          <li><strong className="text-soil">1. Enter a real soil test.</strong> Use lab values for N, P, K and pH, not guesses, for the most meaningful result.</li>
          <li><strong className="text-soil">2. Review the suggestions.</strong> Compare the top crops with your water, season and market before choosing.</li>
          <li><strong className="text-soil">3. Confirm locally.</strong> Check the crop and fertilizer plan with an extension officer or agronomist.</li>
        </ol>
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        {sections.map((section, index) => (
          <section key={section.title} className="rounded-xl bg-paper p-5 shadow-sm ring-1 ring-field/10 sm:p-6">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage font-bold text-field">{index + 1}</span>
              <h3 className="text-xl font-bold text-field">{section.title}</h3>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-soil/70">{section.intro}</p>
            <div className="space-y-4">
              {section.points.map(([title, body]) => (
                <article key={title}>
                  <h4 className="font-bold text-soil">{title}</h4>
                  <p className="mt-1 text-sm leading-relaxed text-soil/75">{body}</p>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="rounded-xl bg-paper p-5 shadow-sm ring-1 ring-field/10 sm:p-6">
        <h3 className="text-xl font-bold text-field">Before-you-sow checklist</h3>
        <ul className="mt-3 grid gap-2 text-sm text-soil/80 sm:grid-cols-2">
          {checklist.map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden="true" className="mt-0.5 text-field">☐</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        <section className="rounded-xl bg-paper p-5 shadow-sm ring-1 ring-field/10 sm:p-6">
          <h3 className="text-xl font-bold text-field">Quick glossary</h3>
          <dl className="mt-3 space-y-3">
            {glossary.map(([term, def]) => (
              <div key={term}>
                <dt className="font-bold text-soil">{term}</dt>
                <dd className="text-sm leading-relaxed text-soil/75">{def}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-xl bg-paper p-5 shadow-sm ring-1 ring-field/10 sm:p-6">
          <h3 className="text-xl font-bold text-field">Common questions</h3>
          <div className="mt-3 divide-y divide-field/10">
            {faqs.map(([q, a]) => (
              <details key={q} className="group py-3">
                <summary className="cursor-pointer list-none font-bold text-soil marker:content-none">
                  <span className="mr-2 inline-block text-field transition group-open:rotate-90">›</span>
                  {q}
                </summary>
                <p className="mt-2 pl-5 text-sm leading-relaxed text-soil/75">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>

      <aside className="rounded-xl border border-wheat/50 bg-wheat/15 p-5 text-sm leading-relaxed text-soil">
        <strong>For fertilizer rates:</strong> take your soil report to a local agricultural extension officer or qualified agronomist. They can match the recommendation to your crop, field, fertilizer products and local regulations.
      </aside>
    </main>
  );
}