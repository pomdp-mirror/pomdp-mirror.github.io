import { useEffect, useId, useState } from 'react'
import publication from '@publication'
import './App.css'

const teaserFrameCount = 24

const imgBase = `${import.meta.env.BASE_URL}imgs`
const videoBase = `${import.meta.env.BASE_URL}videos`

const sim2realVideos = [
  { id: 'drawer_open', label: 'Drawer Opening', file: 'real_exp_drawer_open.mp4' },
  { id: 'drawer_close', label: 'Drawer Closing', file: 'real_exp_drawer_close.mp4' },
  { id: 'cube_drop', label: 'Cube Dropping', file: 'real_exp_cube_drop.mp4' },
  { id: 'hammer_lift', label: 'Hammer Lifting', file: 'real_exp_hammer_lifting.mp4' },
]

const buildTeaserTasks = (taskDefs, imageSuffix) =>
  taskDefs.map((task) => {
    const base = `${imgBase}/${task.folder}`
    return {
      ...task,
      staticObservation: `${base}/Obs_Group_obs_raw${imageSuffix}.png`,
      staticAction: `${base}/Act_Group_act${imageSuffix}.png`,
      animatedObservations: Array.from(
        { length: teaserFrameCount },
        (_, index) => `${base}/Obs_Group_obs_raw_${index}${imageSuffix}.png`,
      ),
      animatedActions: Array.from(
        { length: teaserFrameCount },
        (_, index) => `${base}/Act_Group_act_${index}${imageSuffix}.png`,
      ),
    }
  })

const teaserTasks = buildTeaserTasks(
  [
    { id: 'drawer_open', label: 'Drawer Opening', folder: 'drawer_open_seed_5_sample_288' },
    { id: 'drawer_close', label: 'Drawer Closing', folder: 'drawer_close_seed_4_sample_488' },
    { id: 'cube_drop', label: 'Cube Dropping', folder: 'cube_drop_seed_5_sample_16' },
    { id: 'hammer_lift', label: 'Hammer Lifting', folder: 'hammer_lift_seed_4_sample_16' },
  ],
  '_agentview_image',
)

const realModalityTasks = buildTeaserTasks(
  [
    { id: 'real_drawer_open', label: 'Drawer Opening', folder: 'real_drawer_open_seed_2_sample_464' },
    { id: 'real_drawer_close', label: 'Drawer Closing', folder: 'real_drawer_close_seed_2_sample_352' },
    { id: 'real_cube_drop', label: 'Cube Dropping', folder: 'real_cube_drop_seed_3_sample_16' },
    { id: 'real_hammer_lift', label: 'Hammer Lifting', folder: 'real_hammer_lift_seed3_sample_16' },
  ],
  '_agentview_height_map_with_segmentation',
)

const links = [
  { label: 'arXiv', href: '', iconClass: 'ai ai-arxiv' },
  { label: 'PDF', href: '', iconClass: 'fas fa-file-pdf' },
  { label: 'Code', href: '', iconClass: 'fab fa-github' },
  { label: 'Data', href: '', iconClass: 'fas fa-database' },
]

function TeaserBlock({ tasks, observationVariant = 'square', caption }) {
  const [teaserAngleStep, setTeaserAngleStep] = useState(0)
  const [isTeaserPlaying, setIsTeaserPlaying] = useState(true)
  const [selectedTaskId, setSelectedTaskId] = useState(tasks[0].id)
  const teaserFrameIndex = teaserAngleStep % teaserFrameCount
  const reflectionAngle = teaserAngleStep * (360 / teaserFrameCount)
  const currentTask = tasks.find((task) => task.id === selectedTaskId) ?? tasks[0]

  const sliderId = useId()
  const arrowMarkerId = useId()

  const observationClass =
    observationVariant === 'tall' ? 'teaser-image is-tall-observation' : 'teaser-image is-observation'
  const teaserClass = observationVariant === 'tall' ? 'teaser is-tall' : 'teaser'

  useEffect(() => {
    tasks.forEach((task) => {
      const taskFrames = [
        task.staticObservation,
        task.staticAction,
        ...task.animatedObservations,
        ...task.animatedActions,
      ]
      taskFrames.forEach((src) => {
        const image = new window.Image()
        image.src = src
      })
    })
  }, [tasks])

  useEffect(() => {
    if (!isTeaserPlaying) {
      return undefined
    }

    const timerId = window.setInterval(() => {
      setTeaserAngleStep((currentStep) => (currentStep + 1) % (teaserFrameCount + 1))
    }, 180)

    return () => window.clearInterval(timerId)
  }, [isTeaserPlaying])

  return (
    <figure className={teaserClass}>
      <div className="teaser-flow">
        <div className="teaser-transform" aria-hidden="true">
          <span>MIRROR</span>
          <svg className="teaser-transform-arrow" viewBox="0 0 340 120" focusable="false">
            <defs>
              <marker
                id={arrowMarkerId}
                markerHeight="12"
                markerUnits="userSpaceOnUse"
                markerWidth="12"
                orient="auto"
                refX="11"
                refY="6"
                viewBox="0 0 12 12"
              >
                <path d="M0 0 L12 6 L0 12 Z" />
              </marker>
            </defs>
            <path
              className="teaser-transform-arrow-path"
              d="M72 92 C126 40 218 38 276 86"
              markerEnd={`url(#${arrowMarkerId})`}
            />
          </svg>
        </div>

        <div className="teaser-panel is-source">
          <div className="teaser-cell">
            <h3 className="teaser-cell-title">Observation</h3>
            <img
              className={observationClass}
              src={currentTask.staticObservation}
              alt={`Original ${currentTask.label.toLowerCase()} observation`}
              width="400"
              height="400"
            />
          </div>
          <div className="teaser-cell">
            <h3 className="teaser-cell-title">Action</h3>
            <img
              className="teaser-image"
              src={currentTask.staticAction}
              alt={`Original ${currentTask.label.toLowerCase()} action`}
              width="400"
              height="400"
            />
          </div>
        </div>

        <div className="teaser-panel is-transformed">
          <div className="teaser-cell">
            <h3 className="teaser-cell-title">Transformed Observation</h3>
            <img
              className={observationClass}
              src={currentTask.animatedObservations[teaserFrameIndex]}
              alt={`${currentTask.label} observation frame ${teaserFrameIndex}`}
              width="400"
              height="400"
            />
          </div>
          <div className="teaser-cell">
            <h3 className="teaser-cell-title">Transformed Action</h3>
            <img
              className="teaser-image"
              src={currentTask.animatedActions[teaserFrameIndex]}
              alt={`${currentTask.label} action frame ${teaserFrameIndex}`}
              width="400"
              height="400"
            />
          </div>
        </div>
      </div>
      <div className="teaser-slider">
        <button
          className="teaser-play-button"
          type="button"
          aria-label={isTeaserPlaying ? 'Stop reflection angle autoplay' : 'Play reflection angle autoplay'}
          aria-pressed={isTeaserPlaying}
          onClick={() => setIsTeaserPlaying((currentValue) => !currentValue)}
        >
          <span
            className={isTeaserPlaying ? 'teaser-stop-icon' : 'teaser-play-icon'}
            aria-hidden="true"
          ></span>
        </button>
        <label className="teaser-slider-label" htmlFor={sliderId}>
          Reflection Angle
        </label>
        <input
          id={sliderId}
          type="range"
          aria-label="Reflection angle"
          min="0"
          max={teaserFrameCount}
          step="1"
          value={teaserAngleStep}
          onPointerDown={() => setIsTeaserPlaying(false)}
          onKeyDown={() => setIsTeaserPlaying(false)}
          onChange={(event) => {
            setIsTeaserPlaying(false)
            setTeaserAngleStep(Number(event.target.value))
          }}
        />
        <output htmlFor={sliderId}>{reflectionAngle}°</output>
      </div>
      <div className="teaser-task-selector" role="tablist" aria-label="Demonstration task">
        {tasks.map((task) => {
          const isActive = task.id === selectedTaskId
          return (
            <button
              key={task.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`teaser-task-button${isActive ? ' is-active' : ''}`}
              onClick={() => setSelectedTaskId(task.id)}
            >
              {task.label}
            </button>
          )
        })}
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  )
}

function App() {
  return (
    <main>
      <section className="hero-section">
        <div className="container is-max-desktop has-text-centered">
          <h1 className="publication-title">
            MIRROR: Reflecting Hidden Symmetries from Offline Robot Interaction Data
          </h1>

          <div className="publication-authors">
            {publication.authors.map((author, index) => (
              <span className="author-block" key={author.name}>
                <span className="author-name">{author.name}</span>
                {author.affiliation ? <sup>{author.affiliation}</sup> : null}
                {index < publication.authors.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>

          {publication.affiliations.length > 0 ? (
            <div className="publication-affiliations">
              {publication.affiliations.map((affiliation) => (
                <span key={affiliation.id}>
                  <sup>{affiliation.id}</sup>{affiliation.name}
                </span>
              ))}
            </div>
          ) : null}

          {publication.venue ? <p className="venue">{publication.venue}</p> : null}

          <div className="publication-links" aria-label="Paper resources">
            {links.map((link) => {
              const content = (
                <>
                  <span className="icon">
                    <i className={link.iconClass}></i>
                  </span>
                  <span>{link.label}</span>
                </>
              )
              return link.href ? (
                <a className="button is-dark is-rounded" href={link.href} key={link.label}>
                  {content}
                </a>
              ) : (
                <button className="button is-dark is-rounded" type="button" disabled key={link.label}>
                  {content}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="section teaser-section">
        <div className="container is-max-widescreen">
          <TeaserBlock
            tasks={teaserTasks}
            caption={
              <>
                Given an observation–action pair (<em>o</em>, <em>a</em>), MIRROR produces a symmetric counterpart:
                the observation is reflected to a rotated scene, and the in-plane action components
                (Δ<em>x</em>, Δ<em>y</em>) are reflected consistently with the observation, while the remaining
                components are unchanged.
              </>
            }
          />
        </div>
      </section>

      <section className="section">
        <div className="container is-max-desktop">
          <h2 className="title">Abstract</h2>
          <div className="content has-text-justified">
            <p>
              Exploiting symmetry in robot policy learning requires knowing how a symmetry group operates on observations and actions, an assumption that often breaks in partially observable MDPs (POMDPs) with pixel observations, where this operation is nonlinear and difficult to specify by hand. Existing approaches sidestep this challenge using environment-specific preprocessing, limiting portability across tasks and observation modalities. We introduce MIRROR, an adversarial framework that discovers how a symmetry group operates jointly on observations and actions in POMDPs directly from offline interaction data, while explicitly enforcing the group axioms. On four Robosuite tabletop tasks, MIRROR attains the lowest aggregate error on three of four symmetry-quality metrics, including a 61% reduction in compatibility error over LaLiGAN, the strongest GAN baseline on that metric. The discovered operations instantiate an equivariant behavior cloning (BC) policy that outperforms vanilla BC on all four tasks, with per-task gains up to 9.66%, and the same framework transfers zero-shot to a real Kinova GEN3 arm under a different observation modality.
            </p>
          </div>
        </div>
      </section>

      <section className="section overview-video-section">
        <div className="container is-max-desktop">
          <h2 className="title">Video</h2>
          <video
            className="overview-video"
            src={`${videoBase}/overview_video.mp4`}
            controls
            playsInline
            preload="metadata"
            aria-label="MIRROR overview video"
          />
        </div>
      </section>

      <section className="section">
        <div className="container is-max-widescreen">
          <h2 className="title">Method Overview</h2>
          <figure className="method-figure">
            <img src={`${imgBase}/fig_pipeline_v1.png`} alt="MIRROR pipeline overview" />
          </figure>
          <p className="lead">
            MIRROR follows a two-stage latent symmetry discovery process. <strong>Stage 1</strong> pretrains a
            frozen spherical autoencoder (<em>E</em><sub>o</sub>, <em>D</em><sub>o</sub>) that compresses each
            observation into a latent <em>z</em>. <strong>Stage 2</strong> learns symmetry modules
            (<em>E</em><sub>z</sub>, <em>D</em><sub>z</sub>) and (<em>E</em><sub>a</sub>, <em>D</em><sub>a</sub>)
            that map <em>z</em> and the action <em>a</em> into latents on which a linear representation of the
            group <em>G</em> acts; these modules are trained by adversarial tuple matching together with a
            group-consistency regularizer.
          </p>
        </div>
      </section>

      <section className="section results-section">
        <div className="container is-max-widescreen">
          <h2 className="title">Symmetry Metric Evaluation</h2>
          <div className="results-grid">
            <figure>
              <img
                src={`${imgBase}/all_tasks_variants_wasserstein_dist_1.png`}
                alt="Wasserstein distance across tasks and method variants"
              />
              <figcaption>
                <strong>Symmetry Invariance.</strong> Wasserstein distance between the original and transformed
                tuple distributions across tasks (lower is better).
              </figcaption>
            </figure>
            <figure>
              <img
                src={`${imgBase}/all_tasks_variants_identity_error_1.png`}
                alt="Identity error across tasks and method variants"
              />
              <figcaption>
                <strong>Identity.</strong> Reconstruction error when the identity group element is applied
                (lower is better).
              </figcaption>
            </figure>
            <figure>
              <img
                src={`${imgBase}/all_tasks_variants_compatibility_error_1.png`}
                alt="Compatibility error across tasks and method variants"
              />
              <figcaption>
                <strong>Compatibility.</strong> Violation of the group composition rule{' '}
                <em>g</em>·(<em>h</em>·<em>x</em>) = (<em>gh</em>)·<em>x</em> (lower is better).
              </figcaption>
            </figure>
            <figure>
              <img
                src={`${imgBase}/all_tasks_variants_invertibility_error_1.png`}
                alt="Invertibility error across tasks and method variants"
              />
              <figcaption>
                <strong>Invertibility.</strong> Error when applying an element followed by its inverse,
                <em> g</em><sup>-1</sup>·(<em>g</em>·<em>x</em>) (lower is better).
              </figcaption>
            </figure>
          </div>
          <p className="lead">
            We evaluate MIRROR against two GAN baselines (SymGAN and LaLiGAN) along with several variants on four
            symmetry-quality metrics: <strong>Symmetry Invariance</strong>,{' '}
            <strong>Identity</strong>, <strong>Compatibility</strong>, and{' '}
            <strong>Invertibility</strong>. MIRROR attains the best aggregate score on
            Symmetry Invariance, Compatibility and Invertibility, reducing compatibility error by ≥61% and invertibility error by
            ≥39% relative to the GAN baselines.
          </p>
        </div>
      </section>

      <section className="section policy-section">
        <div className="container is-max-widescreen">
          <h2 className="title">Equivariant Policy Learning</h2>
          <p className="lead">
            The discovered group operations (<em>φ<sub>o</sub></em>, <em>φ<sub>a</sub></em>) plug directly into
            an equivariant behavior cloning (BC) policy via frame averaging over a discretized cyclic subgroup{' '}
            <em>H</em> = <em>C<sub>n</sub></em> ⊂ <em>SO</em>(2), trained end-to-end with a standard
            mean-squared BC objective.
          </p>
          <div className="policy-table-wrapper">
            <table className="policy-table">
              <caption>
                Episodic success rates (mean ± std) at the best discretization <em>H</em> = <em>C</em><sub>16</sub>,
                with vanilla BC as reference. <strong>Bold</strong> marks the best entry per column.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Method</th>
                  <th scope="col">Drawer Opening</th>
                  <th scope="col">Drawer Closing</th>
                  <th scope="col">Cube Dropping</th>
                  <th scope="col">Hammer Lifting</th>
                  <th scope="col">Average</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">EBC-ExSym (<em>C</em><sub>16</sub>)</th>
                  <td>0.6467 ± 0.0222</td>
                  <td>0.8640 ± 0.0467</td>
                  <td>0.8093 ± 0.0585</td>
                  <td>0.8513 ± 0.0573</td>
                  <td>0.7928 ± 0.0994</td>
                </tr>
                <tr>
                  <th scope="row">EBC-SymGAN (<em>C</em><sub>16</sub>)</th>
                  <td>0.6627 ± 0.1130</td>
                  <td>0.8580 ± 0.0358</td>
                  <td>0.8193 ± 0.0944</td>
                  <td>0.4980 ± 0.1633</td>
                  <td>0.7095 ± 0.1807</td>
                </tr>
                <tr>
                  <th scope="row">EBC-LaLiGAN (<em>C</em><sub>16</sub>)</th>
                  <td>0.6533 ± 0.0204</td>
                  <td>0.7360 ± 0.0620</td>
                  <td>0.8447 ± 0.0615</td>
                  <td>0.6133 ± 0.0557</td>
                  <td>0.7118 ± 0.1031</td>
                </tr>
                <tr className="policy-row-highlight">
                  <th scope="row">EBC-MIRROR (<em>C</em><sub>16</sub>)</th>
                  <td><strong>0.7173 ± 0.0136</strong></td>
                  <td><strong>0.8980 ± 0.0381</strong></td>
                  <td><strong>0.9026 ± 0.0294</strong></td>
                  <td><strong>0.8871 ± 0.0249</strong></td>
                  <td><strong>0.8512 ± 0.0808</strong></td>
                </tr>
                <tr className="policy-row-baseline">
                  <th scope="row">Vanilla BC</th>
                  <td>0.7140 ± 0.0082</td>
                  <td>0.8813 ± 0.0589</td>
                  <td>0.8060 ± 0.0245</td>
                  <td>0.8180 ± 0.0297</td>
                  <td>0.8048 ± 0.0695</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="lead">
            <strong>EBC-MIRROR wins every task</strong>, lifting the average success rate from 80.48% (vanilla
            BC) to <strong>85.12%</strong>, with the largest per-task gain of <strong>+9.66%</strong> on Cube
            Dropping. Equivariant-BC variants built on hand-designed (EBC-ExSym) or GAN-discovered (EBC-SymGAN,
            EBC-LaLiGAN) symmetries each fall <em>below</em> vanilla BC on average — equivariance helps only when
            the underlying symmetry is accurate, so the gain comes from the quality of the discovered symmetry,
            not from equivariance alone.
          </p>
        </div>
      </section>

      <section className="section teaser-section">
        <div className="container is-max-widescreen">
          <h2 className="title">Real-world Observation Modality</h2>
          <TeaserBlock
            tasks={realModalityTasks}
            observationVariant="tall"
            caption={
              <>
                MIRROR is not tied to any specific observation modality. Retrained on a fundamentally different
                modality (an agent-view height map with segmentation), the same symmetry framework still
                recovers consistent observation–action reflections, enabling sim-to-real deployment on a real
                robot arm.
              </>
            }
          />
        </div>
      </section>

      <section className="section sim2real-section">
        <div className="container is-max-widescreen">
          <h2 className="title">Real-Robot Deployment</h2>
          <p className="lead">
            Real-robot rollouts on a Kinova GEN3 arm. MIRROR is retrained in simulation under a height-map +
            segmentation-mask modality, and the resulting <strong>EBC-MIRROR</strong> policy — an equivariant BC
            policy built on the discovered symmetry — is deployed on the real arm across four tabletop tasks.
          </p>
          <div className="sim2real-grid">
            {sim2realVideos.map((video) => (
              <figure className="sim2real-item" key={video.id}>
                <video
                  className="sim2real-video"
                  src={`${videoBase}/${video.file}`}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  aria-label={`${video.label} real-robot rollout`}
                />
                <figcaption>{video.label}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container is-max-desktop">
          <h2 className="title">BibTeX</h2>
          <pre className="citation">
            <code>{publication.citation}</code>
          </pre>
        </div>
      </section>

      <footer className="footer">
        <div className="container is-max-desktop">
          <p>
            Built as a simple research paper website template. Replace the placeholder text, links, and teaser with
            project-specific content.
          </p>
        </div>
      </footer>
    </main>
  )
}

export default App
