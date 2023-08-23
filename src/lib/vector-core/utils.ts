import * as tf from '@tensorflow/tfjs'

function cosine(queryVec: tf.TensorLike, vecsBatch: tf.TensorLike) {
    return tf.tidy(() => {
        const queryTensor = tf.tensor(queryVec)
        const batchTensor = tf.tensor(vecsBatch)

        const dotProduct = tf.sum(tf.mul(batchTensor, queryTensor), 1)
        const normA = tf.norm(queryTensor)
        const normB = tf.norm(batchTensor, 'euclidean', 1)

        return dotProduct.div(normA.mul(normB)).arraySync()
    })
}

async function batchCosine(queryVec: Float64Array, vecsBatch: Float64Array[]) {
    const queryVec32 = new Float32Array(queryVec)
    const vecsBatch32 = vecsBatch.map((vec) => new Float32Array(vec))

    return tf.tidy(() => {
        const queryTensor = tf.tensor(queryVec32, [1, queryVec32.length])
        const batchTensor = tf.tensor(vecsBatch32)

        const dotProduct = tf.matMul(queryTensor, batchTensor, false, true)
        const normA = tf.norm(queryTensor)
        const normB = tf.norm(batchTensor, 'euclidean', 1)

        return dotProduct.div(normA.mul(normB)).arraySync()
    })
}

function euclidean(vecA: tf.Tensor, vecB: tf.Tensor): number {
    const diff = vecA.sub(vecB)
    return diff.norm().arraySync() as number
}

function batchEuclidean(queryVec: Float64Array, vecsBatch: Float64Array[]) {
    const queryVec32 = new Float32Array(queryVec)
    const vecsBatch32 = vecsBatch.map((vec) => new Float32Array(vec))
    return tf.tidy(() => {
        const queryTensor = tf.tensor(queryVec32, [1, queryVec32.length])
        const batchTensor = tf.tensor(vecsBatch32)

        const diff = tf.sub(queryTensor, batchTensor)
        const squaredDiff = tf.square(diff)
        const sumSquaredDiff = tf.sum(squaredDiff, 1)

        const distances = tf.sqrt(sumSquaredDiff)

        return distances.arraySync()
    })
}

function magnitude(vector: Float64Array): number {
    return Math.sqrt(Array.from(vector).reduce((acc, val) => acc + val * val, 0))
}

export { cosine, batchCosine, euclidean, magnitude, batchEuclidean }
