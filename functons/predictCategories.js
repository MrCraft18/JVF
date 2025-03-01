import { spawn } from 'child_process'
import { configDotenv } from 'dotenv'; configDotenv()

export default function predictCategories(textsArray) {
    return new Promise(resolve => {
        const pythonProcess = spawn('python', ['./py/predict_categories.py'])

        pythonProcess.stdin.write(JSON.stringify(textsArray))
        pythonProcess.stdin.end()

        let dataString = ''

        pythonProcess.stdout.on('data', data => {
            dataString += data.toString()
        })

        pythonProcess.stderr.on('data', data => {
            throw new Error(`Python Error: ${data}`)
        })

        pythonProcess.on('error', err => {
            throw new Error(`Failed to start Python process: ${err.message}`)
        })

        pythonProcess.on('close', code => {
            if (code !== 0) throw new Error(`Python process exited with code ${code}`)

            resolve(JSON.parse(dataString))
        })
    })
}
