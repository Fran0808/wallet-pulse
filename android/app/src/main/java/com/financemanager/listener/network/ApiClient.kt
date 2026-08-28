package com.financemanager.listener.network

import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST

interface ApiService {
    @POST("api/v1/transactions/sync/batch")
    suspend fun syncBatch(@Body requests: List<TransactionSyncDto>): Response<Any>
}

object ApiClient {
    private const val BASE_URL = "http://127.0.0.1:8080/"

    val service: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }
}