const state = require('./state.js')
const spawn = require('child_process').spawn
const exec = require('child_process').exec;
const gm = require('gm').subClass({imageMagick: true})
const videoshow = require('videoshow')
const fs = require('fs')
const path = require('path')
const rootPath = path.resolve(__dirname, '..')
const subtitle = require('subtitle')
var fffmpeg = require('fluent-ffmpeg');

const robot = async() => {
    const loop = 8;
    const content = state.load()
    await convertAllImages(content)   
    await createYoutubeThumbnail()
    await createConfigVideo(content)
    await createSubtitles(content)
    await renderYoutubeVideo(content)
    await mergeSubtitlesAndYoutubeVideo(content)

    state.save(content)

    async function convertAllImages(content){
        for(let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++){
            await convertImage(sentenceIndex, content.sentences[sentenceIndex])
        }
    }
    
    async function convertImage(sentenceIndex, sentence){
        return new Promise((resolve, reject) => {
            const inputFile = `./content/${sentenceIndex}-original.png[0]`
            const outputFile = `./content/${sentenceIndex}-converted.png`
            const width = 1920
            const height = 1080

        gm()
            .in(inputFile)
            .out('(')
                .out('-clone')
                .out('0')
                .out('-background', 'white')
                .out('-blur', '0x9')
                .out('-resize', `${width}x${height}^`)
            .out(')')
            .out('(')
                .out('-clone')
                .out('0')
                .out('-background', 'white')
                .out('-resize', `${width}x${height}`)
            .out(')')
            .out('-delete', '0')
            .out('-gravity', 'center')
            .out('-compose', 'over')
            .out('-composite')
            .out('-extent', `${width}x${height}`)        
                .write(outputFile, (error) => {
                    if(error){  
                        return reject(error)
                    }

                    console.log(`Imagem convertida: ${outputFile}`)
                    sentence.imagePath = outputFile
                    resolve()                
                })
        })       
    }

    async function createYoutubeThumbnail(){
        return new Promise((resolve, reject) => {
            gm()
            .in('./content/0-converted.png')
            .write('./content/youtube-thumbnail.jpg', (error) =>{
                if(error){
                    return reject(error)
                }

                console.log(' criando thumbnail do youtube')
                resolve()
            })
        })
    }
    
    async function createConfigVideo(content){
        const nameVideo = `${content.searchTerm.trim().replace(' ','')}.mp4`
        const destinationPath = `${rootPath}/content/${nameVideo}`
       
        var images = []

        for(let imageIndex = 0; imageIndex < content.sentences.length; imageIndex++){
            images.push(content.sentences[imageIndex].imagePath);
        }

        var videoConfig =  {
            output: destinationPath,            
            options: {
              fps: 25,
              loop: loop,
              transition: true,
              transitionDuration: 1,
              videoBitrate: 1024, 
              videoCodec: 'libx264',         
              size: "640x?",
              audioBitrate: "128k",
              audioChannels: 2,
              format: "mp4",
              outputOptions: ['-pix_fmt yuv420p']           
            },
            images: images
          }

        state.saveVideoConfig(videoConfig)
        content.destinationPath = destinationPath
        content.nameVideo = nameVideo
    }

    async function createSubtitles(content){
        const subtitles = []
        const timeBreak = 1000; // milliseconds
        const sentenceDuration = (loop - 1) * timeBreak; // milliseconds

        let currentTime = timeBreak;       
        let subDuration = sentenceDuration;

        for(let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++){

            const sub = {
                start: currentTime,
                end: subDuration,
                text: content.sentences[sentenceIndex].text
            }
            subtitles.push(sub);

            currentTime = subDuration + timeBreak
            subDuration = sentenceDuration + currentTime
        }

          const srt = subtitle.stringify(subtitles)
          
          state.saveVideoSubtitle(srt)
    }

    async function renderYoutubeVideo(content){
        return new Promise((resolve, reject) => {
            const ffmpegRender = `videoshow`     
            const videoConfig = `${rootPath}/videoConfig.json`
            const audionPath = `${rootPath}/audio/song.mp3`

            const options = [                
                '--config', videoConfig,
                '--output', content.destinationPath,
                '--audio', audionPath               
            ]

            console.log('rendenizando o video...', ffmpegRender, options.join(' '))
            
            var cmd = `${ffmpegRender} ${options.join(' ')}`

            exec(cmd, function(error, stdout, stderr) {
                if(error){
                    console.error(`Error: ${error}`)
                }

                if(stdout){
                    console.log('Video rendenizado', stdout)
                }

                if(stderr){
                    console.error('stderr', stderr)
                }         
                resolve()           
            });
        })
    }

    async function mergeSubtitlesAndYoutubeVideo(content){
        const subtitlePath = './content/subtitle.srt'
        const videoPath = `./content/${content.nameVideo}`
        const videoDestinationPath = `./content/s_${content.nameVideo}`
        const outputOptions = `-vf subtitles=${subtitlePath}:force_style='Fontsize=20,PrimaryColour=&HDDDE5F&'"`
        const videoCodec = 'libx264'

        fffmpeg(videoPath)
            .videoCodec(videoCodec)            
            .outputOptions(outputOptions)
            .on('error', function(err) {
                console.error(`Error: ${err}`)
            })
            .save(videoDestinationPath)
            .on('end', function() {
                console.log('sucess')              
            })
    }
}

module.exports = robot