<template>
  <div class="py-8 max-w-4xl mx-auto bg-white">
    <div class="text-center mb-12">
      <h1 class="text-5xl font-bold mb-4">
        <span class="font-thin">VIVEK</span><span class="font-black">JOSHY</span>
      </h1>
      <div class="flex flex-wrap justify-center gap-4 text-subheading text-lg">
        <a href="mailto:contact@vivekjoshy.com" class="flex items-center hover:text-accent">
          <i class="fa-regular fa-envelope mr-2"></i> contact@vivekjoshy.com
        </a>
        <span class="hidden md:inline">•</span>
        <a href="tel:+919207024069" class="flex items-center hover:text-accent">
          <i class="fa-solid fa-mobile-alt mr-2"></i> +91-9207024069
        </a>
        <span class="hidden md:inline">•</span>
        <a href="https://www.github.com/vivekjoshy" target="_blank" class="flex items-center hover:text-accent">
          <i class="fa-brands fa-github mr-2"></i> github.com/vivekjoshy
        </a>
      </div>
    </div>

    <!-- Professional Experience Section -->
    <section class="mb-10">
      <h2 class="section-heading border-b border-accent pb-1 mb-6 text-xl">Professional Experience</h2>
      
      <div class="mb-8">
        <div class="flex flex-col md:flex-row md:justify-between md:items-baseline mb-2">
          <h3 class="subsection-heading text-lg">Vairified Corp</h3>
          <span>January 2024 -- Present</span>
        </div>
        <div class="flex flex-col md:flex-row md:justify-between md:items-baseline mb-3">
          <h4 class="subsubsection-heading text-lg">Data Scientist</h4>
          <span class="italic">Naples, Florida</span>
        </div>
        <ul class="list-disc pl-5 space-y-2 text-lg">
          <li>Built VAIR rating system for competitive player assessment.</li>
          <li>Created REST APIs and dashboards for real-time analysis.</li>
        </ul>
      </div>
      
      <div class="mb-8">
        <div class="flex flex-col md:flex-row md:justify-between md:items-baseline mb-2">
          <h3 class="subsection-heading text-lg">Pickleball Players Network</h3>
          <span>October 2023 -- December 2024</span>
        </div>
        <div class="flex flex-col md:flex-row md:justify-between md:items-baseline mb-3">
          <h4 class="subsubsection-heading text-lg">Data Scientist</h4>
          <span class="italic">Los Angeles, California</span>
        </div>
        <ul class="list-disc pl-5 space-y-2 text-lg">
          <li>Created matchmaking algorithms and skill assessment models.</li>
          <li>Built prototype system using Python and PostgreSQL.</li>
        </ul>
      </div>
      
      <div class="mb-8">
        <div class="flex flex-col md:flex-row md:justify-between md:items-baseline mb-2">
          <h3 class="subsection-heading text-lg">Open Source Development</h3>
          <span>2016 -- Present</span>
        </div>
        <ul class="list-disc pl-5 space-y-2 text-lg">
          <li>Built IRC servers and web apps on shared hosting platforms.</li>
          <li>Created CI/CD pipelines and infrastructure solutions.</li>
        </ul>
      </div>
    </section>
    
    <!-- Technical Projects Section -->
    <section class="mb-10">
      <h2 class="section-heading border-b border-accent pb-1 mb-6 text-xl">Technical Projects</h2>
      
      <div class="mb-8">
        <div class="flex flex-col md:flex-row md:justify-between md:items-baseline mb-2">
          <h3 class="subsection-heading text-lg">BELKA Molecular Interaction Challenge</h3>
          <span>2024</span>
        </div>
        <ul class="list-disc pl-5 space-y-2 text-lg">
          <li>Won Kaggle silver medal in BELKA protein-molecule interaction challenge.</li>
          <li>Implemented domain adversarial training with gradient reversal.</li>
          <li>Designed a custom molecular data processing architecture.</li>
        </ul>
      </div>
      
      <div class="mb-8">
        <div class="flex flex-col md:flex-row md:justify-between md:items-baseline mb-2">
          <h3 class="subsection-heading text-lg">SAT/SMT Solver</h3>
          <span>2024</span>
        </div>
        <ul class="list-disc pl-5 space-y-2 text-lg">
          <li>Built CDCL-based reinforcement learning system for SAT/SMT problems.</li>
          <li>Custom rewards created for efficient solution space exploration.</li>
        </ul>
      </div>
      
      <div class="mb-8">
        <div class="flex flex-col md:flex-row md:justify-between md:items-baseline mb-2">
          <h3 class="subsection-heading text-lg">Prompt Ensemble Framework</h3>
          <span>2024</span>
        </div>
        <ul class="list-disc pl-5 space-y-2 text-lg">
          <li>Built an entropy-based framework for token evidence aggregation.</li>
          <li>Created logarithmic pooling for confidence scoring.</li>
        </ul>
      </div>
    </section>
    
    <!-- Publications Section -->
    <section class="mb-10">
      <h2 class="section-heading border-b border-accent pb-1 mb-6 text-xl">Publications</h2>
      
      <div class="mb-8">
        <div class="flex flex-col md:flex-row md:justify-between md:items-baseline mb-2">
          <h3 class="subsection-heading text-lg">OpenSkill: Multi-team Rating System</h3>
          <span>2024</span>
        </div>
        <p class="text-lg">Journal of Open Source Software (<a href="https://doi.org/10.21105/joss.05901" class="text-accent hover:underline" target="_blank">DOI: 10.21105/joss.05901</a>)</p>
      </div>
      
      <div class="mb-8">
        <div class="flex flex-col md:flex-row md:justify-between md:items-baseline mb-2">
          <h3 class="subsection-heading text-lg">The Hitchhiker's Guide to Python</h3>
          <span>2017</span>
        </div>
        <p class="text-lg">Contributed to Common Gotchas chapter (<a href="https://docs.python-guide.org/writing/gotchas/" class="text-accent hover:underline" target="_blank">docs.python-guide.org</a>)</p>
      </div>
    </section>
    
    <!-- Skills Section -->
    <section class="mb-10">
      <h2 class="section-heading border-b border-accent pb-1 mb-6 text-xl">Skills</h2>
      
      <div class="space-y-4">
        <div>
          <h3 class="subsection-heading mb-1 text-lg inline-block">Technologies:</h3>
          <p class="text-lg inline-block ml-2">PyTorch, TensorFlow, Pandas/Polars, BioPython, Ray/RLLIB, FastAPI</p>
        </div>
        
        <div>
          <h3 class="subsection-heading mb-1 text-lg inline-block">DevOps & Data:</h3>
          <p class="text-lg inline-block ml-2">Git, Docker, AWS, GCP, PostgreSQL, MongoDB, TypeDB, RDF/SPARQL</p>
        </div>
        
        <div>
          <h3 class="subsection-heading mb-1 text-lg inline-block">Core:</h3>
          <p class="text-lg inline-block ml-2">Deep Learning, Reinforcement Learning, Bioinformatics, Mathematical Logic</p>
        </div>
      </div>
    </section>
    
    <!-- Education Section -->
    <section class="mb-10">
      <h2 class="section-heading border-b border-accent pb-1 mb-6 text-xl">Education</h2>
      
      <div class="mb-8">
        <div class="flex flex-col md:flex-row md:justify-between md:items-baseline mb-2">
          <h3 class="subsection-heading text-lg">Mahatma Gandhi University</h3>
          <span>2024</span>
        </div>
        <div class="flex flex-col md:flex-row md:justify-between md:items-baseline">
          <p class="italic text-lg">Bachelor of Science in Bioinformatics</p>
          <span>Aluva, India</span>
        </div>
      </div>
    </section>
    
    <div class="text-center text-subheading text-lg mt-10">
      References available on request
    </div>

    <div class="flex justify-center mt-10">
      <button @click="downloadPDF" class="btn btn-accent text-white btn-lg">Download PDF Resume</button>
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore - Nuxt auto-imports
import { definePageMeta, useHead } from '#imports';

definePageMeta({
  layout: "default"
});

useHead({
  title: 'Resume',
  meta: [
    { name: 'description', content: 'Professional resume of Vivek Joshy - Data Scientist & Computational Biologist with expertise in formal systems, deep learning, and bioinformatics.' }
  ]
});

const downloadPDF = () => {
  // Create a link to the PDF file and trigger a download
  const link = document.createElement('a');
  link.href = '/assets/resume.pdf';
  link.setAttribute('download', 'Vivek_Joshy_Resume.pdf');
  link.setAttribute('target', '_blank');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script> 