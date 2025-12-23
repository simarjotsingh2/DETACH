'use client'

import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { motion } from 'framer-motion'
import { Award, Heart, Leaf, Shield, Sparkles, Users } from 'lucide-react'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black">
      <Navigation />

      {/* Hero */}
      <section className="relative pt-28 md:pt-32 pb-20 border-b border-primary-800 bg-gradient-to-b from-black via-primary-900/40 to-black">
        <div className="container-custom px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
              <span className="text-white">ABOUT</span> <span className="text-gradient">US</span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl leading-relaxed">
              We craft bold streetwear for the urban rebel. Defy convention, embrace the edge.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="section-padding border-b border-primary-800">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-white">Our Mission</h2>
              <p className="text-gray-300 leading-relaxed">
                To empower self-expression through meticulously designed apparel that blends comfort, durability,
                and a fearless aesthetic. Every piece is crafted to move with you, wherever your city takes you.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="card"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <div className="text-accent-400 text-2xl font-bold">2019</div>
                  <div className="text-gray-400">Founded</div>
                </div>
                <div>
                  <div className="text-accent-400 text-2xl font-bold">10K+</div>
                  <div className="text-gray-400">Customers</div>
                </div>
                <div>
                  <div className="text-accent-400 text-2xl font-bold">500+</div>
                  <div className="text-gray-400">Designs</div>
                </div>
                <div>
                  <div className="text-accent-400 text-2xl font-bold">50+</div>
                  <div className="text-gray-400">Countries</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding border-b border-primary-800 bg-primary-900/30">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-10">What Drives Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="card"
            >
              <Sparkles className="w-8 h-8 text-accent-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Originality</h3>
              <p className="text-gray-300">Designs that turn heads without saying a word.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="card"
            >
              <Shield className="w-8 h-8 text-accent-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Quality</h3>
              <p className="text-gray-300">Premium fabrics, precise cuts, and long-lasting wear.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="card"
            >
              <Leaf className="w-8 h-8 text-accent-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Responsibility</h3>
              <p className="text-gray-300">Smarter sourcing and packaging for a lighter footprint.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-padding border-b border-primary-800">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-10">Our Story</h2>
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-primary-800" />
            <div className="space-y-10">
              {[
                { year: '2019', title: 'The Spark', desc: 'Launched with a handful of tees and a big idea.' },
                { year: '2021', title: 'Going Global', desc: 'Shipped to 25+ countries and expanded our catalog.' },
                { year: '2024', title: 'Sustainable Shift', desc: 'Introduced recycled blends and eco packaging.' },
              ].map((item, idx) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="relative grid md:grid-cols-2 gap-6"
                >
                  <div className="pl-10 md:pl-0 md:pr-8 md:text-right">
                    <div className="inline-flex items-center space-x-3">
                      <span className="text-accent-400 font-bold text-xl">{item.year}</span>
                      <Award className="w-5 h-5 text-accent-400" />
                    </div>
                    <h3 className="text-white text-xl font-semibold mt-2">{item.title}</h3>
                    <p className="text-gray-300 mt-2">{item.desc}</p>
                  </div>
                  <div className="pl-10 md:pl-8">
                    <div className="w-3 h-3 rounded-full bg-accent-500 absolute left-3 top-2 md:left-1/2 md:-ml-1.5" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section-padding border-b border-primary-800 bg-primary-900/30">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white">Meet the Team</h2>
            <Users className="w-6 h-6 text-accent-400 hidden md:block" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Alex Night', role: 'Creative Director' },
              { name: 'Riley Stone', role: 'Lead Designer' },
              { name: 'Jordan Flux', role: 'Production Manager' },
              { name: 'Casey Vex', role: 'Community Lead' },
            ].map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="card text-center"
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-primary-800 border border-primary-700 flex items-center justify-center mb-4">
                  <span className="text-accent-400 text-xl font-bold">{member.name.split(' ')[0][0]}{member.name.split(' ')[1][0]}</span>
                </div>
                <h3 className="text-white font-semibold">{member.name}</h3>
                <p className="text-gray-400 text-sm">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="card flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div>
              <h3 className="text-2xl md:text-3xl font-display font-bold text-white">Join the movement</h3>
              <p className="text-gray-300 mt-2">Subscribe for drops, stories, and exclusive perks.</p>
            </div>
            <form className="w-full md:w-auto flex gap-3">
              <input type="email" placeholder="Enter your email" className="input-field flex-1 md:w-80" />
              <button type="button" className="btn-primary">Subscribe</button>
            </form>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}